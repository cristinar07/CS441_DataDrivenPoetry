let keyframes = [
  {
    activeVerse: 0,
    activeLines: [], // no lines to highlight
    svgUpdate: null  // nothing to render here
  },
  { 
    activeVerse: 1, 
    activeLines: [1, 2, 3, 4],
    svgUpdate: () => drawVis1() 
  },
  { 
    activeVerse: 2, 
    activeLines: [1, 2, 3, 4],
    svgUpdate: () => drawVis12() 
  },
  { 
    activeVerse: 3, 
    activeLines: [1, 2, 3, 4], 
    svgUpdate: () => drawVis13() 
  },
  { 
    activeVerse: 4, 
    activeLines: [1, 2, 3, 4] 
  },
  { 
    activeVerse: 5, 
    activeLines: [1, 2, 3, 4], 
    svgUpdate: () => {
      createBarGraph(CauseDeathData, "#vis5");
      boldWord("tide rose higher", "#006400");
      boldWord("sun burned fierce", "#006400");
      boldWord("beyond their will", "#006400");
      highlightBar("Harsh environmental conditions ", "#vis5", "#006400");
    }
  },
  { 
    activeVerse: 6, 
    activeLines: [1, 2, 3, 4], 
    svgUpdate: () => {
      createBarGraph(CauseDeathData, "#vis6");
      boldWord("Trespassers", "#8B0000");
      boldWord("Statistics", "#8B0000");
      boldWord("Infractions", "#8B0000");
      highlightBar(["Violence", "Mixed or unknown", "Vehicle accident "], "#vis6", "#8B0000");
    }
  },
  { 
    activeVerse: 7, 
    activeLines: [1, 2, 3, 4], 
    svgUpdate: () => {
      createBarGraph(CauseDeathData, "#vis7");
      boldWord("sea", "#00008b");
      highlightBar("Drowning", "#vis7", "#00008b");
    }
  },
  { 
    activeVerse: 8, 
    activeLines: [1, 2, 3, 4] 
  },
  { 
    activeVerse: 9, 
    activeLines: [1, 2, 3, 4], 
    svgUpdate: () => drawTimelineGraph(TimelineData, 2014, "vis9")  // Default to 2014 initially
  },
  { 
    activeVerse: 10, 
    activeLines: [1, 2, 3, 4], 
    svgUpdate: () => drawTimelineGraph(TimelineData, 2019, "vis10")  // 5 years later

  },
  { 
    activeVerse: 11, 
    activeLines: [1, 2, 3, 4, 5], 
    svgUpdate: () => drawTimelineGraph(TimelineData, 2024, "vis11")  // Close to recent years

  },
  { 
    activeVerse: 12, 
    activeLines: [1, 2, 3, 4, 5, 6] 
  }
];
let svg = d3.select("#svg");
const width = 500;
const height = 400;

let keyframeIndex = 0;
let CauseDeathData;
let TimelineData;

let vis1Initialized = false;
let vis1Interval;
let vis1Journeys = [];
let vis1Batches = [];
let vis1Svg;
let vis1Projection;
let vis1Path;


  function drawKeyframe(index) {
    const kf = keyframes[index];
    keyframeIndex = index;

    // Reset all active lines
    document.querySelectorAll(".poem-box p").forEach(p => p.classList.remove("active-line"));

    // Activate current lines
    kf.activeLines.forEach(lineNum => {
      const lineId = `line${lineNum}-verse${kf.activeVerse}`;
      const line = document.getElementById(lineId);
      if (line) line.classList.add("active-line");
    });

    // Scroll to verse section
    const verse = document.getElementById(`verse${kf.activeVerse}`);
    if (verse) verse.scrollIntoView({ behavior: "smooth", block: "center" });

    // Update timeline highlight
    document.querySelectorAll(".timeline-node").forEach(n => n.classList.remove("active"));
    const activeNode = document.querySelector(`.timeline-node[data-slide="${kf.activeVerse + 1}"]`);
    if (activeNode) activeNode.classList.add("active");

    // Run visualization
    if (kf.svgUpdate) kf.svgUpdate();
  }

  // Timeline node click handling
  document.querySelectorAll(".timeline-node").forEach(node => {
    node.addEventListener("click", () => {
      const slideNum = parseInt(node.getAttribute("data-slide"));
      const frameIndex = keyframes.findIndex(kf => kf.activeVerse === slideNum - 1);
      if (frameIndex !== -1) drawKeyframe(frameIndex);
    });
  });

  // Scroll-down indicator click starts at first verse
  const scrollIndicator = document.querySelector(".scroll-indicator");
  if (scrollIndicator) {
    scrollIndicator.addEventListener("click", () => drawKeyframe(0));
  }

  let zoomGroup;

  async function drawVis1() {
    const svg = d3.select("#vis1")
      .attr("viewBox", [0, 0, 960, 600])
      .attr("preserveAspectRatio", "xMidYMid meet");
  
    vis1Svg = svg;
    if (!vis1Initialized) {
      svg.selectAll("*").remove();
  
      const width = 960, height = 600;
  
      vis1Projection = d3.geoNaturalEarth1()
        .scale(160)
        .translate([width / 2, height / 2]);
  
      vis1Path = d3.geoPath().projection(vis1Projection);
      zoomGroup = svg.append("g").attr("id", "zoom-group");
  
      const world = await d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json");
      const countries = topojson.feature(world, world.objects.countries);
  
      zoomGroup.append("g")
        .selectAll("path")
        .data(countries.features)
        .join("path")
        .attr("fill", "#fae3e0")
        .attr("stroke", "#999")
        .attr("stroke-width", 0.5)
        .attr("d", vis1Path);
  
      svg.append("text")
        .attr("id", "vis1-title")
        .attr("x", width / 2)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .style("fill", "#3d252a")
        .style("font-weight", "bold");
  
      svg.append("text")
        .attr("id", "vis1-caption")
        .attr("x", width / 2)
        .attr("y", height - 10)
        .attr("text-anchor", "middle")
        .style("font-size", "13px")
        .style("fill", "#444")
        .text("Each arc represents a migration journey from origin to destination.");
  
      svg.append("text")
        .attr("id", "toggle-animation")
        .attr("x", 30)
        .attr("y", 30)
        .style("font-size", "16px")
        .style("cursor", "pointer")
        .style("fill", "#3d252a");
  
      svg.append("text")
        .attr("x", 30)
        .attr("y", 550)
        .text("➕")
        .style("font-size", "22px")
        .style("cursor", "pointer")
        .on("click", () => svg.transition().call(zoom.scaleBy, 1.3));
  
      svg.append("text")
        .attr("x", 30)
        .attr("y", 580)
        .text("➖")
        .style("font-size", "22px")
        .style("cursor", "pointer")
        .on("click", () => svg.transition().call(zoom.scaleBy, 0.7));
  
      const zoom = d3.zoom()
        .scaleExtent([1, 8])
        .on("zoom", (event) => zoomGroup.attr("transform", event.transform));
  
      svg.call(zoom);
  
      svg.append("defs").append("marker")
        .attr("id", "arrowhead")
        .attr("viewBox", "-5 -5 10 10")
        .attr("refX", 0)
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M -4,-2 L 0,0 L -4,2")
        .attr("fill", "#80383d")
        .attr("opacity", 0.7);
  
      const rawData = await d3.csv("final_missing_migrants_preprocessed.csv");
  
      vis1Batches = d3.group(
        rawData.map(d => {
          const originLat = +d["Origin Latitude"];
          const originLon = +d["Origin Longitude"];
          const coords = d["Coordinates"]?.split(",").map(c => +c.trim());
          const year = +d["Incident Year"];
          if (!coords || coords.length !== 2 || isNaN(originLat) || isNaN(originLon) || isNaN(year)) return null;
          return {
            origin: [originLon, originLat],
            destination: [coords[1], coords[0]],
            year
          };
        }).filter(Boolean),
        d => d.year
      );
  
      vis1Years = Array.from(vis1Batches.keys()).sort((a, b) => a - b);
      currentYearIndex = 0;
  
      const dropdown = d3.select("#year-dropdown");
      if (dropdown.empty()) {
        svg.append("foreignObject")
          .attr("x", 750)
          .attr("y", 20)
          .attr("width", 180)
          .attr("height", 40)
          .append("xhtml:div")
          .html(`
            <div style="display:flex; align-items:center; gap:8px;">
              <label for="year-dropdown" style="font-size:13px;">Jump to:</label>
              <select id="year-dropdown" style="padding: 4px; font-size:13px; border-radius:4px;"></select>
            </div>
          `);
        const dropdownMenu = d3.select("#year-dropdown");
        vis1Years.forEach(y => dropdownMenu.append("option").attr("value", y).text(y));
        dropdownMenu.on("change", function () {
          const selectedYear = +this.value;
          currentYearIndex = vis1Years.indexOf(selectedYear);
          drawYear(selectedYear);
          clearInterval(vis1Interval);
          updatePlayButton(true);
        });
      }
  
      vis1Initialized = true;
    }
  
    function updatePlayButton(paused) {
      d3.select("#toggle-animation").text(paused ? "▶️ Play" : "⏸ Pause");
      isPaused = paused;
    }
  
    function drawYear(year) {
      d3.select("#vis1-title").text(`Global Migrant Journeys (${year})`);
      d3.select("#year-dropdown").property("value", year);
      const batch = vis1Batches.get(year) || [];
      zoomGroup.selectAll(".journey").remove();
  
      zoomGroup.selectAll(".journey")
        .data(batch)
        .enter()
        .append("path")
        .attr("class", "journey")
        .attr("fill", "none")
        .attr("stroke", "#80383d")
        .attr("stroke-opacity", 0.4)
        .attr("stroke-width", 1.5)
        .attr("marker-end", "url(#arrowhead)")
        .attr("d", d => {
          const source = vis1Projection(d.origin);
          const target = vis1Projection(d.destination);
          const dx = target[0] - source[0];
          const dy = target[1] - source[1];
          const dr = Math.sqrt(dx * dx + dy * dy) * 1.5;
          return `M${source[0]},${source[1]} A${dr},${dr} 0 0,1 ${target[0]},${target[1]}`;
        })
        .attr("stroke-dasharray", function () {
          const len = this.getTotalLength();
          return `${len} ${len}`;
        })
        .attr("stroke-dashoffset", function () {
          return this.getTotalLength();
        })
        .transition()
        .duration(2000)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0);
    }
  
    function startAnimation() {
      if (vis1Interval) clearInterval(vis1Interval);
      vis1Interval = setInterval(() => {
        currentYearIndex = (currentYearIndex + 1) % vis1Years.length;
        drawYear(vis1Years[currentYearIndex]);
      }, 4000);
      updatePlayButton(false);
    }
  
    drawYear(vis1Years[0]);
    startAnimation();
  
    d3.select("#toggle-animation").on("click", function () {
      if (!isPaused) {
        clearInterval(vis1Interval);
        updatePlayButton(true);
      } else {
        startAnimation();
      }
    });
  }
  
   

  async function drawVis12() {
    const svg = d3.select("#vis2")
    .attr("viewBox", [0, 0, 960, 600])
    .attr("preserveAspectRatio", "xMidYMid meet");
    svg.selectAll("*").remove();
  
    const width = 960;
    const height = 600;
  
    const projection = d3.geoNaturalEarth1()
      .scale(160)
      .translate([width / 2, height / 2]);
  
    const path = d3.geoPath().projection(projection);
  
    const world = await d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json");
    const countries = topojson.feature(world, world.objects.countries);
  
    const data = await d3.csv("final_missing_migrants_preprocessed.csv");
  
    const countryStats = d3.rollup(
      data,
      v => d3.sum(v, d => +d["Total Number of Dead and Missing"]),
      d => d["Country of Incident"]
    );
  
    const maxDeaths = d3.max(Array.from(countryStats.values()));
  
    const colorBreaks = [10, 100, 500, 1000, 3000, 8000, maxDeaths];
    const customColorScale = d3.scaleThreshold()
      .domain(colorBreaks)
      .range(["#fae3e0", "#f4c6c1", "#e6b0aa", "#cc6f73", "#80383d", "#3d252a", "#1f1317"]);
  
    const g = svg.append("g");
    let dotVisible = false;
  
    // Draw country map
    g.selectAll("path")
      .data(countries.features)
      .join("path")
      .attr("fill", d => {
        const deaths = countryStats.get(d.properties.name) || 0;
        return customColorScale(deaths);
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 0.5)
      .attr("d", path)
      .append("title")
      .text(d => {
        const name = d.properties.name;
        const deaths = countryStats.get(name) || 0;
        return `${name}: ${deaths.toLocaleString()} deaths/missing`;
      });
  
    // Add Title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .style("font-size", "20px")
      .style("fill", "#3d252a")
      .style("font-weight", "bold")
      .text("Total Migrant Deaths and Missing by Country");
  
    // Add Legend
    const legendData = customColorScale.range().map((color, i) => {
      const from = i === 0 ? 0 : customColorScale.domain()[i - 1];
      const to = customColorScale.domain()[i] || maxDeaths;
      return {
        color,
        label: i === customColorScale.range().length - 1 ? `${from}+` : `${from}–${to - 1}`
      };
    });
  
    const legendPadding = 10;
    const bandWidth = 50;
    const legendWidth = bandWidth * legendData.length;
    const legendHeight = 12;
    const legendX = width - legendWidth - 180;
    const legendY = height - 50;
  
    const legendGroup = svg.append("g")
      .attr("transform", `translate(${legendX}, ${legendY})`);
  
    legendGroup.selectAll("rect")
      .data(legendData)
      .enter()
      .append("rect")
      .attr("x", (d, i) => i * (bandWidth + legendPadding))
      .attr("width", bandWidth)
      .attr("height", legendHeight)
      .attr("fill", d => d.color);
  
    legendGroup.selectAll("text")
      .data(legendData)
      .enter()
      .append("text")
      .attr("x", (d, i) => i * (bandWidth + legendPadding) + bandWidth / 2)
      .attr("y", legendHeight + 14)
      .attr("text-anchor", "middle")
      .style("font-size", "11px")
      .style("fill", "#333")
      .text(d => d.label);
  
    // Zoom buttons
    svg.append("text")
      .attr("id", "zoom-in")
      .attr("x", 30)
      .attr("y", height - 70)
      .text("➕")
      .style("font-size", "24px")
      .style("cursor", "pointer")
      .on("click", () => svg.transition().call(zoom.scaleBy, 1.3));
  
    svg.append("text")
      .attr("id", "zoom-out")
      .attr("x", 30)
      .attr("y", height - 35)
      .text("➖")
      .style("font-size", "24px")
      .style("cursor", "pointer")
      .on("click", () => svg.transition().call(zoom.scaleBy, 0.7));
  
    const zoom = d3.zoom()
      .scaleExtent([1, 10])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
  
        // When zoomed in enough, show dots
        if (event.transform.k > 3 && !dotVisible) {
          drawDotMap(data, g, projection);
          dotVisible = true;
        } else if (event.transform.k <= 3 && dotVisible) {
          g.selectAll(".dot").remove();
          dotVisible = false;
        }
      });
  
    svg.call(zoom);
  }
  
  // Dot drawing helper
  function drawDotMap(data, g, projection) {
    g.selectAll(".dot")
      .data(data.filter(d => {
        const coords = d["Coordinates"]?.split(",").map(c => +c.trim());
        return coords && coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1]);
      }))
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", d => projection([+d["Coordinates"].split(",")[1], +d["Coordinates"].split(",")[0]])[0])
      .attr("cy", d => projection([+d["Coordinates"].split(",")[1], +d["Coordinates"].split(",")[0]])[1])
      .attr("r", 1.4)
      .attr("fill", "#fcd85d")
      .attr("opacity", 0.5);
  }
  
  async function drawVis13() {
    const svg = d3.select("#vis3")
  .attr("viewBox", "0 0 960 600")
  .attr("preserveAspectRatio", "xMidYMid meet");
    svg.selectAll("*").remove();
  
    const width = 960;
    const height = 600;
  
    const projection = d3.geoNaturalEarth1()
      .scale(160)
      .translate([width / 2, height / 2]);
  
    const path = d3.geoPath().projection(projection);
  
    const world = await d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json");
    const countries = topojson.feature(world, world.objects.countries);
  
    const data = await d3.csv("final_missing_migrants_preprocessed.csv");
  
    const g = svg.append("g");
  
    // Base map
    g.selectAll("path")
      .data(countries.features)
      .join("path")
      .attr("fill", "#fae3e0")
      .attr("stroke", "#999")
      .attr("stroke-width", 0.5)
      .attr("d", path);
  
    // Title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .style("font-size", "20px")
      .style("fill", "#3d252a")
      .style("font-weight", "bold")
      .text("Migrant Profiles by Type");
  
    // Dot drawing
    const dots = data.filter(d => {
      const coords = d["Coordinates"]?.split(",").map(c => +c.trim());
      return coords && coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1]);
    });
  
    g.selectAll("circle")
      .data(dots)
      .enter()
      .append("circle")
      .attr("cx", d => projection([+d["Coordinates"].split(",")[1], +d["Coordinates"].split(",")[0]])[0])
      .attr("cy", d => projection([+d["Coordinates"].split(",")[1], +d["Coordinates"].split(",")[0]])[1])
      .attr("r", 2.5)
      .attr("opacity", 0.65)
      .attr("fill", d => {
        if (+d["Number of Children"] > 0) return "#fcd85d";
        if (+d["Number of Females"] > 0) return "#cc6f73";
        if (+d["Number of Males"] > 0) return "#80383d";
        return "#3d252a";
      });
  
    // Zoom feature
    const zoom = d3.zoom()
      .scaleExtent([1, 8])
      .on("zoom", (event) => g.attr("transform", event.transform));
  
    svg.call(zoom);
  
    // Zoom buttons
    svg.append("text")
      .attr("id", "zoom-in")
      .attr("x", 30)
      .attr("y", height - 70)
      .text("➕")
      .style("font-size", "24px")
      .style("cursor", "pointer")
      .on("click", () => svg.transition().call(zoom.scaleBy, 1.3));
  
    svg.append("text")
      .attr("id", "zoom-out")
      .attr("x", 30)
      .attr("y", height - 35)
      .text("➖")
      .style("font-size", "24px")
      .style("cursor", "pointer")
      .on("click", () => svg.transition().call(zoom.scaleBy, 0.7));
  
    // Color Legend
    const legendItems = [
      { label: "Children", color: "#fcd85d" },
      { label: "Women", color: "#cc6f73" },
      { label: "Men", color: "#80383d" },
      { label: "Unknown", color: "#3d252a" }
    ];
  
    const legendGroup = svg.append("g")
      .attr("transform", `translate(${width - 160}, 60)`);
  
    legendGroup.selectAll("rect")
      .data(legendItems)
      .enter()
      .append("rect")
      .attr("x", 0)
      .attr("y", (d, i) => i * 20)
      .attr("width", 12)
      .attr("height", 12)
      .attr("fill", d => d.color);
  
    legendGroup.selectAll("text")
      .data(legendItems)
      .enter()
      .append("text")
      .attr("x", 18)
      .attr("y", (d, i) => i * 20 + 10)
      .text(d => d.label)
      .attr("font-size", "12px")
      .attr("fill", "#3d252a");
  }
  
  
  
 // Declare 'svg' inside the initialiseSVG function
 function initialiseSVG() {
  const svg = d3.select("#svg"); // Ensure svg is initialized here

  svg.attr("width", width);
  svg.attr("height", height);

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
      .style("font-size", "12px")
      .style("fill", "white")
      .text("");
}

function createBarGraph(data, svgId) {
  const width = 800, height = 600; // Smaller width and height
  const margin = { top: 30, right: 30, bottom: 150, left: 50 }; // Increased bottom margin for labels

  const svg = d3.select(svgId)
    .attr("width", width)
    .attr("height", height);

  // Define Scales
  const x = d3.scaleBand()
    .domain(data.map(d => d.cause))
    .range([margin.left, width - margin.right])
    .padding(0.2);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.count)])
    .nice()
    .range([height - margin.bottom, margin.top]);

  // Create Axes
  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(-45)") // Rotate x-axis labels for better readability
    .style("text-anchor", "end");

  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y));

  // Add Chart Title
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", margin.top / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .text("Cause of Death Statistics");

  // Create Bars
  svg.selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", d => x(d.cause))
    .attr("y", d => y(d.count))
    .attr("width", x.bandwidth())
    .attr("height", d => height - margin.bottom - y(d.count))
    .attr("fill", "#7d4d57")
    .on("mouseover", function(event, d) {
        d3.select(this).transition().attr("r", 6).attr("fill", "darkred");

        // Show the tooltip on hover
        tooltip.style("visibility", "visible")
               .html(`Cause: ${d.cause}<br>Count: ${d.count}`)
               .style("top", (event.pageY - 30) + "px")
               .style("left", (event.pageX + 10) + "px");
    })
    .on("mousemove", function(event) {
        tooltip.style("top", (event.pageY - 30) + "px")
               .style("left", (event.pageX + 10) + "px");
    })
    .on("mouseout", function() {
        d3.select(this).transition().attr("r", 4).attr("fill", "#7d4d57");
        tooltip.style("visibility", "hidden");
    });

  // Tooltip div (hidden initially)
  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background", "rgba(0, 0, 0, 0.7)")
    .style("color", "#fff")
    .style("padding", "6px 10px")
    .style("border-radius", "5px")
    .style("font-size", "12px")
    .style("pointer-events", "none")
    .style("visibility", "hidden");
}




async function loadData() {
  await d3.csv("final_missing_migrants_preprocessed.csv").then(function(data) {
    console.log("CSV Data Loaded:", data);
    
    // Process data (Example: Counting deaths by cause)
    const causeCounts = d3.rollup(data, v => v.length, d => d["Cause of Death"]);
  
    // Convert Map to Array for D3
    const formattedData = Array.from(causeCounts, ([cause, count]) => ({ cause, count }));
    formattedData.pop();

    formattedData.forEach(function(d) {
      d.cause = d.cause.split('/')[0]; // Keep only the part before '/'
    });
  
    
    CauseDeathData = formattedData;

    console.log("CSV Raw Data:", data.slice(0, 5)); // Print first 5 rows to check column names

    // Ensure correct column names
    const yearCol = "Incident Year";  // Correct column name
    const monthCol = "Month";         // Correct column name
    const deathsCol = "Total Number of Dead and Missing"; 

    // Convert values to numbers
    data.forEach(d => {
      d[yearCol] = +d[yearCol]; // Convert year to number
      d[monthCol] = +d[monthCol]; // Convert month to number
      d[deathsCol] = +d[deathsCol] || 0; // Convert deaths to number, default to 0
    });

    // Process Timeline Data (Grouping by Year and Month)
    const groupedData = d3.rollup(
      data, 
      v => d3.sum(v, d => d[deathsCol]), // Sum deaths per month
      d => d[yearCol], 
      d => d[monthCol]
    );

    // Convert Map to Array
    TimelineData = [];
    groupedData.forEach((months, year) => {
      months.forEach((total, month) => {
        TimelineData.push({
          year: year,
          month: month,
          total_deaths_missing: total
        });
      });
    });

    console.log("Processed Data", TimelineData);

  }).catch(function(error) {
    console.error("Error loading CSV:", error);
  });
  
}

function drawTimelineGraph(data, selectedYear, svgId) {
  const width = 800, height = 600;  // Match createBarGraph
  const margin = { top: 50, right: 100, bottom: 80, left: 50 }; // Adjusted top and right margins

  // Select the SVG element and clear previous content
  const svg = d3.select(`#${svgId}`);
  svg.selectAll("*").remove();
  svg.attr("width", width).attr("height", height);

  // Filter and SORT data for the selected year by month
  const yearData = data.filter(d => d.year === selectedYear).sort((a, b) => a.month - b.month);

  console.log("Sorted Year Data:", yearData); // Debugging check

  // Define scales
  const x = d3.scaleBand()
      .domain(d3.range(1, 13)) // Months 1-12
      .range([margin.left, width - margin.right])
      .padding(0.1);

  const y = d3.scaleLinear()
      .domain([0, d3.max(yearData, d => d.total_deaths_missing) || 10]) // Ensure valid range
      .nice()
      .range([height - margin.bottom, margin.top]);

  // Add Title
  svg.append("text")
      .attr("x", width / 2)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .style("font-weight", "bold")
      .text("Monthly Deaths and Missing Migrants");

  // Display Selected Year in Top Right Corner
  svg.append("text")
      .attr("x", width - margin.right)
      .attr("y", 20)
      .attr("text-anchor", "end")
      .style("font-size", "16px")
      .style("fill", "gray")
      .text(`Year: ${selectedYear}`);

  // Add Axes
  svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).tickFormat(d => d3.timeFormat("%b")(new Date(2024, d - 1, 1))))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

  svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));

  // Define line generator
  const line = d3.line()
      .x(d => x(d.month) + x.bandwidth() / 2)  // Center line on month bands
      .y(d => y(d.total_deaths_missing))
      .curve(d3.curveMonotoneX);  // Smooth curve

  // Draw the line
  svg.append("path")
      .datum(yearData)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 3)
      .attr("d", line);

  // Tooltip div (hidden initially)
  const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("background", "rgba(0, 0, 0, 0.7)")
      .style("color", "#fff")
      .style("padding", "6px 10px")
      .style("border-radius", "5px")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .style("visibility", "hidden");

  // Add points on the line with hover interaction
  svg.selectAll(".dot")
      .data(yearData)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", d => x(d.month) + x.bandwidth() / 2)
      .attr("cy", d => y(d.total_deaths_missing))
      .attr("r", 5)
      .attr("fill", "red")
      .on("mouseover", function(event, d) {
          d3.select(this).transition().attr("r", 8).attr("fill", "darkred");

          tooltip.style("visibility", "visible")
                 .html(`<strong>${d3.timeFormat("%B")(new Date(2024, d.month - 1, 1))}</strong>: ${d.total_deaths_missing} deaths`)
                 .style("top", (event.pageY - 30) + "px")
                 .style("left", (event.pageX + 10) + "px");
      })
      .on("mousemove", function(event) {
          tooltip.style("top", (event.pageY - 30) + "px")
                 .style("left", (event.pageX + 10) + "px");
      })
      .on("mouseout", function() {
          d3.select(this).transition().attr("r", 5).attr("fill", "red");
          tooltip.style("visibility", "hidden");
      });
}

function boldWord(word, color) {
  // Get the active verse (it should be a part of the current stanza)
  const activeVerseId = `verse${keyframeIndex + 1}`; // Get active verse ID based on the current index
  const verse = document.getElementById(activeVerseId);
  
  // Select all paragraphs in the current active verse
  const paragraphs = verse ? verse.querySelectorAll("p") : [];

  paragraphs.forEach(p => {
    // Check if the word exists in the paragraph
    const regex = new RegExp(`(${word})`, 'gi'); // Case-insensitive search
    p.innerHTML = p.innerHTML.replace(regex, '<span class="bold-word">$1</span>');
  });

  // Apply bold styling to the selected word (you can style this class)
  const boldWords = document.querySelectorAll(".bold-word");
  boldWords.forEach(boldWord => {
    boldWord.style.fontWeight = 'bold'; // Apply bold styling
    boldWord.style.color = color; // Apply a specific color
  });
}


function highlightBar(causes, svgId, color) {
  // Ensure causes is always an array (handle single or multiple cases)
  const causesArray = Array.isArray(causes) ? causes : [causes];

  // Select all bars in the current chart within a specific SVG container
  const bars = d3.select(svgId).selectAll(".bar");

  // Reset any previous highlights
  bars.attr("fill", "#7d4d57");  // Default color

  // Iterate over the array of causes and highlight the matching bars
  causesArray.forEach(cause => {
    bars.filter(d => d.cause === cause)
        .attr("fill", color)  // New highlight color
        .attr("stroke", "#000")   // Optional stroke to make it stand out
        .attr("stroke-width", 2);  // Optional stroke width for emphasis
  });
}

// Scroll-based verse detection
const verseSections = document.querySelectorAll(".full-slide");

const observerOptions = {
  root: null,
  threshold: 0.5 // Trigger when 50% of the section is in view
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const verseId = entry.target.id; // e.g., 'verse3'
      const verseNum = parseInt(verseId.replace("verse", ""));
      const frameIndex = keyframes.findIndex(kf => kf.activeVerse === verseNum);
      if (frameIndex !== -1 && frameIndex !== keyframeIndex) {
        drawKeyframe(frameIndex);
      }
    }
  });
}, observerOptions);

// Start observing each verse section
verseSections.forEach(section => observer.observe(section));


async function initialise() {
  await loadData();
  initialiseSVG();
  drawKeyframe(keyframeIndex);
}

initialise();
