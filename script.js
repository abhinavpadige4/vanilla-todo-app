// script.js – Todo List app using localStorage
// Data model: { id: string, text: string, completed: boolean }

// Key used in localStorage
const STORAGE_KEY = "tasks";

// Cached DOM elements
const form = document.querySelector("form");
const input = document.getElementById("task-input");
const taskList = document.getElementById("task-list");

// In‑memory task array
let tasks = [];

/** Load tasks from localStorage (or initialise empty) */
function loadTasks() {
  const raw = localStorage.getItem(STORAGE_KEY);
  try {
    tasks = raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to parse tasks from localStorage", e);
    tasks = [];
  }
}

/** Persist current tasks array to localStorage */
function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

/** Render the whole task list */
function renderTasks() {
  // Clear existing list
  taskList.innerHTML = "";

  tasks.forEach(task => {
    const li = document.createElement("li");
    li.className = "task-item";
    li.dataset.id = task.id;

    // Checkbox
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", "Mark task as completed");

    // Label (task text)
    const label = document.createElement("label");
    label.className = "task-label";
    label.textContent = task.text;
    if (task.completed) label.classList.add("completed");

    // Delete button (inline SVG for X icon)
    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "task-delete";
    delBtn.setAttribute("aria-label", "Delete task");
    delBtn.innerHTML = `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;

    // Assemble li
    li.appendChild(checkbox);
    li.appendChild(label);
    li.appendChild(delBtn);
    taskList.appendChild(li);
  });
}

/** Add a new task from the input field */
function addTask(event) {
  event.preventDefault(); // prevent form submission reload
  const rawText = input.value.trim();
  if (!rawText) return; // ignore empty input

  const newTask = {
    id: Date.now().toString(),
    text: rawText,
    completed: false
  };
  tasks.push(newTask);
  saveTasks();
  renderTasks();
  input.value = ""; // clear input
  input.focus();
}

/** Toggle completed state for a task */
function toggleComplete(id, completed) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  task.completed = completed;
  saveTasks();
  renderTasks();
}

/** Delete a task by id */
function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
}

/** Event delegation for checkbox changes and delete clicks */
function handleTaskListClick(event) {
  const li = event.target.closest("li.task-item");
  if (!li) return; // click outside a task item
  const id = li.dataset.id;

  if (event.target.matches("input.task-checkbox")) {
    toggleComplete(id, event.target.checked);
  } else if (event.target.matches("button.task-delete, button.task-delete *")) {
    // If the click is on the SVG inside the button, still treat as delete
    deleteTask(id);
  }
}

// Initialise app
loadTasks();
renderTasks();

// Bind events
form.addEventListener("submit", addTask);
taskList.addEventListener("change", handleTaskListClick); // checkbox change bubbles as 'change'
taskList.addEventListener("click", handleTaskListClick);
