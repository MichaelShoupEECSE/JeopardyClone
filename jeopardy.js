const Num_Cats = 6;
const Num_Clues_Per_Cat = 5;
let categories = [];
// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

async function getCategoryIds() {
    let response = await axios.get('https://jservice.io/api/categories?count=100');
    let catIds = response.data.map(c => c.id);
    return _.sampleSize(catIds, Num_Cats)
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory(catId) {
    let response = await axios.get(`https://jservice.io/api/category?id=${catId}`);
    let cat = response.data;
    let allCluesList = cat.clues;
    let randomClues = _.sampleSize(allCluesList, Num_Clues_Per_Cat);
    let clues = randomClues.map(c => ({
        question: c.question,
        answer: c.answer,
        value: c.value,
        showing: null
    }));

    return { title: cat.title, clues };
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable() {
    // Create and append the header row to the grid
    $("#jeopardy").find("thead").empty();
    let $tr = $("<tr>");
    for (let catIndex = 0; catIndex < Num_Cats; catIndex++) {
        $tr.append($("<th>").text(categories[catIndex].title));
    };
    $("#jeopardy").find("thead").append($tr);

    // Create and append the clue boxes
    for (let clueIndex = 0; clueIndex < Num_Clues_Per_Cat; clueIndex++) {
        let $tr = $("<tr>");
        for (let catIndex = 0; catIndex < Num_Cats; catIndex++) {
            $tr.append($("<td>").attr("id", `${catIndex}-${clueIndex}`).text("?"));
        };
        $("#jeopardy").find("tbody").append($tr);
    };
};

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(evt) {
    let id = evt.target.id;
    let [catId, clueId] = id.split("-");
    let clue = categories[catId].clues[clueId];

    let msg;

    if (!clue.showing) {
        msg = clue.question;
        clue.showing = "question";
    } else if (clue.showing === "question") {
        msg = `${clue.answer} - ${clue.value}`;
        clue.showing = "answer";
        document.getElementById(`${id}`).style.backgroundColor = "#28a200";
    } else {
        // already showing answer; ignore
        return
    }

    // Update text of cell
    $(`#${catId}-${clueId}`).html(msg);
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {

}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
    let catIds = await getCategoryIds();

    categories = [];

    for (let catId of catIds) {
        categories.push(await getCategory(catId));
    }

    fillTable();
}

/** On click of start / restart button, set up game. */
$("#start-button").on("click", setupAndStart);

/** On page load, add event handler for clicking clues */
$(async function () {
    setupAndStart();
    $("#jeopardy").on("click", "td", handleClick);
});