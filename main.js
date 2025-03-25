let keyframes = [
  { activeVerse: 1, activeLines: [1, 2, 3, 4], svgUpdate: () => drawVis1() },
  { activeVerse: 2, activeLines: [1, 2, 3, 4], svgUpdate: () => drawVis1() },
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

// Dummy visualization functions
function drawVis1() { console.log("Draw Vis 1"); }
function drawVis2() { console.log("Draw Vis 2"); }
function drawVis3() { console.log("Draw Vis 3"); }

