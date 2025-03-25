let keyframes = [
    {
        activeVerse: 1,
        activeLines: [1, 2, 3, 4],
    },
    {
        activeVerse: 2,
        activeLines: [1, 2, 3, 4],
    },
    {
        activeVerse: 3,
        activeLines: [1,2,3,4]
    },
    {
        activeVerse: 4,
        activeLines: [1, 2, 3, 4]
    },
    {
        activeVerse: 5,
        activeLines: [1, 2, 3, 4]
    },
    {
        activeVerse: 6,
        activeLines: [1, 2, 3, 4]
    },
    {
        activeVerse: 7,
        activeLines: [1, 2, 3, 4]
    },
    {
        activeVerse: 8,
        activeLines: [1, 2, 3, 4]
    },
    {
        activeVerse: 9,
        activeLines: [1, 2, 3, 4]
    },
    {
        activeVerse: 10,
        activeLines: [1, 2, 3, 4]
    },
    {
        activeVerse: 11,
        activeLines: [1, 2, 3, 4]
    },
    {
        activeVerse: 12,
        activeLines: [1, 2, 3, 4]
    },
    {
        activeVerse: 13,
        activeLines: [1, 2]
    }
]

let svg = d3.select("#svg");
let keyframeIndex = 0;
const width = 500;
const height = 400;

let chart;
let chartWidth;
let chartHeight;

// Declare both scales too
let xScale;
let yScale;

document.getElementById("forward-button").addEventListener("click", forwardClicked);
document.getElementById("backward-button").addEventListener("click", backwardClicked);

xScale = d3.scaleBand()
    .domain([...new Set(data.map(d => d.cause))]) // Unique causes
    .range([0, chartWidth])
    .padding(0.1);

let yearScale = d3.scaleOrdinal()
    .domain([...new Set(data.map(d => d.year))]) // Unique years
    .range(d3.schemeCategory10);  // D3 color scheme


function forwardClicked() {
    if (keyframeIndex < keyframes.length - 1) {
        keyframeIndex++;
        drawKeyframe(keyframeIndex);
    }
}

function backwardClicked() {
    if (keyframeIndex > 0) {
        keyframeIndex--;
        drawKeyframe(keyframeIndex);
    }
}

function drawKeyframe(kfi) {
    let kf = keyframes[kfi];

    resetActiveLines();

    updateActiveVerse(kf.activeVerse);

    for (line of kf.activeLines) {
        updateActiveLine(kf.activeVerse, line);
    }

    if(kf.svgUpdate) {
        kf.svgUpdate();
    }

}



function resetActiveLines() {
    d3.selectAll(".line").classed("active-verse", false);
}

function updateActiveVerse(id) {
    d3.selectAll(".verse").classed("active-verse", false);
    d3.select("#verse" + id).classed("active-verse", true);

    //scroll the column so the chosen verse is centred
    scrollLeftColumnToActiveVerse(id);
}

function updateActiveLine(vid, lid) {
    let thisVerse = d3.select("#verse" + vid);
    thisVerse.select("#line" + lid).classed("active-line", true);
}


function scrollLeftColumnToActiveVerse(id) {
    // First we want to select the div that is displaying our text content
    var leftColumn = document.querySelector(".left-column-content");

    // Now we select the actual verse we would like to be centred, this will be the <ul> element containing the verse
    var activeVerse = document.getElementById("verse" + id);

    // The getBoundingClientRect() is a built in function that will return an object indicating the exact position
    // Of the relevant element relative to the current viewport.
    // To see a full breakdown of this read the documentation here: https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
    var verseRect = activeVerse.getBoundingClientRect();
    var leftColumnRect = leftColumn.getBoundingClientRect();

    // Now we calculate the exact location we would like to scroll to in order to centre the relevant verse
    // Take a moment to rationalise that this calculation does what you expect it to
    var desiredScrollTop = verseRect.top + leftColumn.scrollTop - leftColumnRect.top - (leftColumnRect.height - verseRect.height) / 2;

    // Finally we scroll to the right location using another built in function.
    // The 'smooth' value means that this is animated rather than happening instantly
    leftColumn.scrollTo({
        top: desiredScrollTop,
        behavior: 'smooth'
    })
}


function initialiseSVG(){
    svg.attr("width",width);
    svg.attr("height",height);

    svg.selectAll("*").remove();

    const margin = { top: 30, right: 30, bottom: 50, left: 50 };
    chartWidth = width - margin.left - margin.right;
    chartHeight = height - margin.top - margin.bottom;

    chart = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    xScale = d3.scaleBand()
        .domain([])
        .range([0, chartWidth])
        .padding(0.1);

    yScale = d3.scaleLinear()
        .domain([])
        .nice()
        .range([chartHeight, 0]);

    // Add x-axis
    chart.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${chartHeight})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text");

    // Add y-axis
    chart.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(yScale))
        .selectAll("text");

    // Add title
    svg.append("text")
        .attr("id", "chart-title")
        .attr("x", width / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("fill", "white")
        .text("");
}


async function initialise() {
    await loadData();
    initialiseSVG();
    drawKeyframe(keyframeIndex);
    makeTextInteractive();
}


initialise();