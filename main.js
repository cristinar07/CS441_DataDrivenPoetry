let keyframes = [
  { activeVerse: 1, activeLines: [1, 2, 3, 4], svgUpdate: () => drawVis1() },
  { activeVerse: 2, activeLines: [1, 2, 3, 4], svgUpdate: () => drawVis12() },
  { activeVerse: 3, activeLines: [1, 2, 3, 4], svgUpdate: () => drawVis1() },
  { activeVerse: 4, activeLines: [1, 2, 3, 4] },
  { activeVerse: 5, activeLines: [1, 2, 3, 4], svgUpdate: () => drawVis2() },
  { activeVerse: 6, activeLines: [1, 2, 3, 4], svgUpdate: () => drawVis2() },
  { activeVerse: 7, activeLines: [1, 2, 3, 4], svgUpdate: () => drawVis2() },
  { activeVerse: 8, activeLines: [1, 2, 3, 4] },
  { activeVerse: 9, activeLines: [1, 2, 3, 4], svgUpdate: () => drawVis3() },
  { activeVerse: 10, activeLines: [1, 2, 3, 4], svgUpdate: () => drawVis3() },
  { activeVerse: 11, activeLines: [1, 2, 3, 4, 5], svgUpdate: () => drawVis3() },
  { activeVerse: 12, activeLines: [1, 2, 3, 4, 5, 6] }
];

let keyframeIndex = 0;

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


  
  async function drawVis1() {
    const svg = d3.select("#vis1");
    vis1Svg = svg;
  
    // First time only: setup map and data
    if (!vis1Initialized) {
      svg.selectAll("*").remove();
  
      const width = 960, height = 600;
  
      vis1Projection = d3.geoNaturalEarth1()
        .scale(160)
        .translate([width / 2, height / 2]);
  
      vis1Path = d3.geoPath().projection(vis1Projection);
  
      const world = await d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json");
      const countries = topojson.feature(world, world.objects.countries);
  
      svg.append("g")
        .selectAll("path")
        .data(countries.features)
        .join("path")
        .attr("fill", "#fae3e0")
        .attr("stroke", "#999")
        .attr("stroke-width", 0.5)
        .attr("d", vis1Path);

      svg.append("text")
        .attr("x", width / 2)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .style("fill", "#3d252a")
        .style("font-weight", "bold")
        .text("Migrant Routes");
  
      const data = await d3.csv("final_missing_migrants_preprocessed.csv");
  
      vis1Journeys = data.map(d => {
        const originLat = parseFloat(d["Origin Latitude"]);
        const originLon = parseFloat(d["Origin Longitude"]);
        const destCoords = d["Coordinates"]?.split(",").map(c => +c.trim());
        if (!destCoords || destCoords.length !== 2) return null;
        const destLat = destCoords[0], destLon = destCoords[1];
  
        if ([originLat, originLon, destLat, destLon].some(isNaN)) return null;
  
        return {
          origin: [originLon, originLat],
          destination: [destLon, destLat]
        };
      }).filter(Boolean);
  
      const batchSize = 100;
      for (let i = 0; i < vis1Journeys.length; i += batchSize) {
        vis1Batches.push(vis1Journeys.slice(i, i + batchSize));
      }
  
      vis1Initialized = true;
    }
  
    // Animate current batch (looped interval)
    let batchIndex = 0;
  
    function drawBatch(index) {
      svg.selectAll(".journey").remove();
  
      const batch = vis1Batches[index];
  
      const paths = svg.selectAll(".journey")
        .data(batch)
        .enter()
        .append("path")
        .attr("class", "journey")
        .attr("fill", "none")
        .attr("stroke", "crimson")
        .attr("stroke-opacity", 0)
        .attr("stroke-width", 1.2)
        .attr("d", d => vis1Path({
          type: "LineString",
          coordinates: [d.origin, d.destination]
        }));
  
      paths.transition()
        .duration(600)
        .attr("stroke-opacity", 0.8)
        .transition()
        .delay(2000)
        .duration(600)
        .attr("stroke-opacity", 0);
    }
  
    drawBatch(batchIndex);
  
    if (vis1Interval) clearInterval(vis1Interval);
  
    vis1Interval = setInterval(() => {
      batchIndex = (batchIndex + 1) % vis1Batches.length;
      drawBatch(batchIndex);
    }, 3200);
  }


  async function drawVis12() {
    const svg = d3.select("#vis2");
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
  
  
  
  
function drawVis2() { console.log("Draw Vis 2"); }
function drawVis3() { console.log("Draw Vis 3"); }

