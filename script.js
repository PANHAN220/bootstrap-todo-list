const STORAGE_KEY = "tasks_v2";
let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let filter = "all";


const todoForm = document.getElementById("todoForm");
const taskInput = document.getElementById("taskInput");
const priorityInput = document.getElementById("priorityInput");
const searchInput = document.getElementById("searchInput");
const taskList = document.getElementById("taskList");
const counter = document.getElementById("counter");
const clearCompleted = document.getElementById("clearCompleted");


const editId = document.getElementById("editId");
const editTitle = document.getElementById("editTitle");
const editPriority = document.getElementById("editPriority");
const editForm = document.getElementById("editForm");
const editModalEl = document.getElementById("editModal");
const editModal = new bootstrap.Modal(editModalEl);

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function uid() {
  return "t_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function badgeClass(priority) {
  if (priority === "high") return "badge-high";
  if (priority === "medium") return "badge-medium";
  return "badge-low";
}

function badgeText(priority) {
  if (priority === "high") return "High";
  if (priority === "medium") return "Medium";
  return "Low";
}

function getVisibleTasks() {
  const q = searchInput.value.trim().toLowerCase();

  return tasks
    .filter(t => {
      if (filter === "active") return !t.completed;
      if (filter === "completed") return t.completed;
      return true; // all
    })
    .filter(t => t.title.toLowerCase().includes(q));
}


function render() {
  taskList.innerHTML = "";

  const visible = getVisibleTasks();

  visible.forEach(task => {
    const li = document.createElement("li");
    li.className = "list-group-item";

    li.innerHTML = `
    <div class="task-card d-flex justify-content-between align-items-center gap-3">
        <div class="task-left">
        <span class="task-badge ${badgeClass(task.priority)}">${badgeText(task.priority)}</span>
        <span class="task-title ${task.completed ? "completed" : ""}">
            ${escapeHtml(task.title)}
        </span>
        </div>

        <div class="task-actions">
        <button class="icon-btn btn-done" data-action="toggle" data-id="${task.id}" title="Complete / Uncomplete">✓</button>
        <button class="icon-btn btn-edit" data-action="edit" data-id="${task.id}" title="Edit">✎</button>
        <button class="icon-btn btn-del" data-action="delete" data-id="${task.id}" title="Delete">✕</button>
        </div>
    </div>
    `;

    taskList.appendChild(li);
  });

  const active = tasks.filter(t => !t.completed).length;
  counter.textContent = `${tasks.length} total, ${active} active`;
}

function escapeHtml(str) {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

//Add Task 
todoForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const title = taskInput.value.trim();
  if (!title) return;

  tasks.push({
    id: uid(),
    title,
    priority: priorityInput.value, 
    completed: false
  });

  taskInput.value = "";
  priorityInput.value = "medium";

  save();
  render();
});

//Search 
searchInput.addEventListener("input", render);

//Filters 
document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    filter = btn.dataset.filter;
    render();
  });
});

//Clear Completed
clearCompleted.addEventListener("click", () => {
  tasks = tasks.filter(t => !t.completed);
  save();
  render();
});


taskList.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;

  const action = btn.dataset.action;
  const id = btn.dataset.id;

  const idx = tasks.findIndex(t => t.id === id);
  if (idx === -1) return;

  if (action === "toggle") {
    tasks[idx].completed = !tasks[idx].completed;
    save();
    render();
  }

  if (action === "delete") {
    tasks.splice(idx, 1);
    save();
    render();
  }

  if (action === "edit") {
    editId.value = tasks[idx].id;
    editTitle.value = tasks[idx].title;
    editPriority.value = tasks[idx].priority;
    editModal.show();
    editModalEl.addEventListener("shown.bs.modal", () => editTitle.focus(), { once: true });
  }
});

//Save edit 
editForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const id = editId.value;
  const idx = tasks.findIndex(t => t.id === id);
  if (idx === -1) return;

  const newTitle = editTitle.value.trim();
  if (!newTitle) return;

  tasks[idx].title = newTitle;
  tasks[idx].priority = editPriority.value;

  save();
  render();
  editModal.hide();
});


render();
