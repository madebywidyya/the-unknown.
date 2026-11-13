const cases = [
  {
    id: "001", category: "MISSING OBJECT / LOGIC", title: "The Vanishing Hour",
    description: "A clock stopped at 11:47. Three witnesses remember the same evening differently. What detail doesn't belong?",
    difficulty: "LEVEL 01 · BEGINNER", clues: "03 CLUES",
    image: "assets/images/case-clock.jpg"
  },
  {
    id: "002", category: "ANONYMOUS MESSAGE / PATTERN", title: "Letters from Nowhere",
    description: "An unsigned letter arrives with a strange sequence of symbols. Its message is hiding in plain sight.",
    difficulty: "LEVEL 02 · INTERMEDIATE", clues: "04 CLUES",
    image: "assets/images/case-letter.jpg"
  },
  {
    id: "003", category: "LOST RECORD / OBSERVATION", title: "The Empty Photograph",
    description: "A photograph appears ordinary at first glance. Look again: one small detail changes the entire story.",
    difficulty: "LEVEL 02 · INTERMEDIATE", clues: "05 CLUES",
    image: "assets/images/case-camera.jpg"
  }
];

const grid = document.querySelector("#caseGrid");
const toast = document.querySelector("#toast");
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function renderCases() {
  grid.innerHTML = cases.map(item => `
    <article class="case-card">
      <div class="case-visual">
        <img src="${item.image}" alt="" loading="lazy">
        <span class="case-number">FILE NO. ${item.id}</span>
        <span class="case-status">● OPEN FILE</span>
      </div>
      <div class="case-info">
        <span class="case-category">${item.category}</span>
        <h3>${item.title}</h3>
        <p>${item.description}</p>
        <div class="case-bottom">
          <span>${item.difficulty}</span>
          <button type="button" data-case="${item.id}">OPEN FILE ↗</button>
        </div>
      </div>
    </article>
  `).join("");
}

grid.addEventListener("click", event => {
  const button = event.target.closest("[data-case]");
  if (!button) return;
  const selected = cases.find(item => item.id === button.dataset.case);
  if (selected) showToast(`FILE ${selected.id}: ${selected.title} — Case gameplay hadir di tahap berikutnya.`);
});

const menuToggle = document.querySelector("#menuToggle");
const mainNav = document.querySelector("#mainNav");
menuToggle.addEventListener("click", () => {
  const open = mainNav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.textContent = open ? "×" : "☰";
});
mainNav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
  mainNav.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.textContent = "☰";
}));

renderCases();
