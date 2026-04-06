// js/app.js

const canvas = document.getElementById("dynastyCanvas");
const ctx = canvas.getContext("2d");
const tooltip = document.getElementById("tooltip");

// --- Configuration ---
const NODE_RADIUS = 20;
const NODE_COLOR_MALE = "#4CAF50"; // Green
const NODE_COLOR_FEMALE = "#f44336"; // Red
const NODE_COLOR_DEFAULT = "#2196F3"; // Blue
const LINE_COLOR = "#999";
const HOVER_COLOR = "#FFEB3B"; // Yellow
const TEXT_COLOR = "#fff";

// Fixed positions for a simple prototype layout
// In a real app, these would be calculated by a layout algorithm
const positions = {
  "person-001": { x: 300, y: 100 }, // Uther
  "person-002": { x: 500, y: 100 }, // Igraine (spouse of Uther)
  "person-003": { x: 400, y: 250 }, // Arthur (child of Uther+Igraine, spouse of Guinevere)
  "person-004": { x: 600, y: 250 }, // Guinevere (spouse of Arthur)
  "person-005": { x: 350, y: 400 }, // Galahad (child of Arthur+Guinevere)
  "person-006": { x: 500, y: 400 }, // Morgan le Fay (child of Arthur+Guinevere)
};

let individualsMap = new Map(); // For quick lookup by ID
let hoverNode = null;

function setCanvasSize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function findIndividualById(id) {
  return dynastyData.individuals.find((ind) => ind.id === id);
}

function getIndividualPosition(id) {
  return positions[id];
}

function drawLine(x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = LINE_COLOR;
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawNode(individual) {
  const pos = getIndividualPosition(individual.id);
  if (!pos) return; // Skip if no position is defined

  ctx.beginPath();
  ctx.arc(pos.x, pos.y, NODE_RADIUS, 0, Math.PI * 2);

  // Set color based on gender
  if (individual.gender === "male") {
    ctx.fillStyle = NODE_COLOR_MALE;
  } else if (individual.gender === "female") {
    ctx.fillStyle = NODE_COLOR_FEMALE;
  } else {
    ctx.fillStyle = NODE_COLOR_DEFAULT;
  }

  if (hoverNode && hoverNode.id === individual.id) {
    ctx.strokeStyle = HOVER_COLOR;
    ctx.lineWidth = 4;
  } else {
    ctx.strokeStyle = `rgba(0,0,0,0.5)`;
    ctx.lineWidth = 1;
  }

  ctx.fill();
  ctx.stroke();

  // Draw name
  ctx.fillStyle = TEXT_COLOR;
  ctx.font = "12px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(
    individual.name.split(" ")[0], // Only show first name for brevity
    pos.x,
    pos.y,
  );
}

function drawConnections() {
  for (const individual of dynastyData.individuals) {
    const currentPos = getIndividualPosition(individual.id);
    if (!currentPos) continue;

    // Draw parent-child lines
    if (individual.parents && individual.parents.length > 0) {
      individual.parents.forEach((parentId) => {
        const parentPos = getIndividualPosition(parentId);
        if (parentPos) {
          // Draw line from parent node to child node
          drawLine(parentPos.x, parentPos.y, currentPos.x, currentPos.y);
        }
      });
    }

    // Draw spouse connection (simple horizontal line between spouses)
    if (individual.spouse) {
      const spousePos = getIndividualPosition(individual.spouse);
      if (spousePos && individual.id < individual.spouse) {
        // Draw only once per couple
        // Draw a horizontal line connecting them at a higher level
        const midX = (currentPos.x + spousePos.x) / 2;
        const midY = Math.min(currentPos.y, spousePos.y) - 40; // Position above the nodes

        drawLine(currentPos.x, currentPos.y, midX, midY);
        drawLine(spousePos.x, spousePos.y, midX, midY);
        // Optionally draw a small circle or line at the connection point
        ctx.beginPath();
        ctx.arc(midX, midY, 5, 0, Math.PI * 2);
        ctx.fillStyle = LINE_COLOR;
        ctx.fill();
      }
    }
  }
}

function renderTree() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas

  drawConnections(); // Draw lines first, so nodes are on top

  for (const individual of dynastyData.individuals) {
    drawNode(individual);
  }
}

function getMousePos(canvas, evt) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top,
  };
}

function checkMouseOver(mousePos) {
  let foundNode = null;
  for (const individual of dynastyData.individuals) {
    const pos = getIndividualPosition(individual.id);
    if (!pos) continue;

    const dx = mousePos.x - pos.x;
    const dy = mousePos.y - pos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < NODE_RADIUS) {
      foundNode = individual;
      break;
    }
  }

  if (foundNode !== hoverNode) {
    hoverNode = foundNode;
    if (hoverNode) {
      tooltip.innerHTML = hoverNode.name;
      tooltip.style.opacity = "1";
      // Position tooltip next to the mouse
      tooltip.style.left = `${mousePos.x + 15}px`;
      tooltip.style.top = `${mousePos.y + 10}px`;
    } else {
      tooltip.style.opacity = "0";
    }
    renderTree(); // Re-render to show hover effect
  }
}

function init() {
  setCanvasSize();
  window.addEventListener("resize", setCanvasSize);

  // Build individuals map for easier access (optional but good practice)
  dynastyData.individuals.forEach((ind) => {
    individualsMap.set(ind.id, ind);
  });

  canvas.addEventListener("mousemove", (event) => {
    const mousePos = getMousePos(canvas, event);
    checkMouseOver(mousePos);
  });

  canvas.addEventListener("mouseout", () => {
    // Hide tooltip and clear hover effect when mouse leaves canvas
    hoverNode = null;
    tooltip.style.opacity = "0";
    renderTree();
  });

  renderTree();
}

init();
