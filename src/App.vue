<template>
	<div class="app">
		<div class="header">
			<h1>Todo App</h1>
			<p>Stay organized. Get things done.</p>
		</div>

		<div class="input-row">
			<input
				type="text"
				placeholder="What needs to be done?"
				v-model="newTask"
				@keydown.enter="addTask"
			>
			<button class="add-btn" @click="addTask">
				<span>+</span> Add
			</button>
		</div>

		<div class="search-wrapper">
			<span class="search-icon">⌕</span>
			<input
				class="search-input"
				type="text"
				placeholder="Search tasks..."
				v-model="search"
			>
		</div>

		<div class="filters">
			<button
				@click="activeFilter = f"
				v-for="f in filters"
				:key="f"
				:class="{ active: activeFilter === f }"
			>
				{{ f }}
			</button>
		</div>

		<ul class="task-list">
			<li
				v-for="task in filteredTasks"
				:key="task.id"
				:class="{ done: task.completed, edit: editingID === task.id }"
			>
				<template v-if="editingID === task.id">
					<input
						type="text"
						v-model="editingBuffer"
						class="edit-input"
						@keyup.enter="finishEdit(task)"
						@keydown.esc="cancelEdit"
						@blur="finishEdit(task)"
						:ref="(el) => el && el.focus()"
					>
				</template>

				<template v-else>
					<input
						class="checkbox"
						type="checkbox"
						v-model="task.completed"
					>

					<span class="task-text" @click="startEdit(task)">
						{{ task.text }}
					</span>

					<button class="fav" @click="toogleFav(task)">
						{{ task.favorite ? '★' : '☆' }}
					</button>

					<button class="delete" @click="removeTask(task.id)">
						×
					</button>
				</template>
			</li>
		</ul>

		<div v-if="filteredTasks.length === 0" class="empty-state">
			<div class="empty-icon">✓</div>
			<h3>No tasks found</h3>
			<p>Add a task to get started.</p>
		</div>
	</div>
</template>

<script setup>

import { ref, computed, watch, onMounted } from 'vue';

const newTask = ref("");
const tasks = ref([]);

function addTask() {
	const text = newTask.value.trim();

	if (!text) return;

	tasks.value.push({
		id: Date.now(),
		text: text,
		completed: false,
		favorite: false,
	});

	newTask.value = "";
}

function removeTask(id) {
	tasks.value = tasks.value.filter((t) => t.id != id);
}

const editingID = ref(null);
const editingBuffer = ref("");

function startEdit(task) {
	editingID.value = task.id;
	editingBuffer.value = task.text;
}

function cancelEdit() {
	editingID.value = null;
	editingBuffer.value = "";
}

function finishEdit(task) {
	if (editingID.value !== task.id) return;

	const trimmed = editingBuffer.value.trim();

	if (!trimmed) {
		removeTask(task.id);
	} else {
		task.text = trimmed;
	}

	cancelEdit();
}

function toogleFav(task) {
	task.favorite = !task.favorite;
}

const search = ref("");
const activeFilter = ref("All");

const filters = [
	"All",
	"Completed",
	"Incomplete",
	"Favorites"
];

const filteredTasks = computed(() => {
	return tasks.value
		.filter(t =>
			t.text
				.toLowerCase()
				.includes(search.value.toLowerCase())
		)
		.filter(t => {
			if (activeFilter.value === "Completed") return t.completed;
			if (activeFilter.value === "Incomplete") return !t.completed;
			if (activeFilter.value === "Favorites") return t.favorite;

			return true;
		});
});

watch(
	tasks,
	() => {
		localStorage.setItem("tasks", JSON.stringify(tasks.value));
	},
	{ deep: true }
);

onMounted(() => {
	const saved = localStorage.getItem("tasks");

	if (saved) {
		tasks.value = JSON.parse(saved);
	}
});

</script>

<style scoped>

* {
	box-sizing: border-box;
}

.app {
	width: min(100% - 2rem, 600px);
	margin: 4rem auto;
	font-family:
		Inter,
		system-ui,
		-apple-system,
		BlinkMacSystemFont,
		"Segoe UI",
		sans-serif;
	color: #1f2937;
}

/* Header */

.header {
	text-align: center;
	margin-bottom: 2rem;
}

.header h1 {
	margin: 0;
	font-size: 2.4rem;
	font-weight: 800;
	letter-spacing: -1px;
	color: #111827;
}

.header p {
	margin: 0.5rem 0 0;
	color: #6b7280;
	font-size: 0.95rem;
}

/* Inputs */

.input-row {
	display: flex;
	gap: 0.7rem;
	margin-bottom: 1rem;
}

input {
	font-family: inherit;
}

.input-row input {
	flex: 1;
	min-width: 0;
	padding: 0.85rem 1rem;
	border: 1px solid #e5e7eb;
	border-radius: 10px;
	background: #fff;
	font-size: 0.95rem;
	outline: none;
	transition: 0.2s ease;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.input-row input:focus,
.search-input:focus,
.edit-input:focus {
	border-color: #6366f1;
	box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
}

.add-btn {
	border: none;
	border-radius: 10px;
	padding: 0 1.2rem;
	background: #6366f1;
	color: white;
	font-weight: 600;
	cursor: pointer;
	transition: 0.2s ease;
	box-shadow: 0 4px 10px rgba(99, 102, 241, 0.2);
}

.add-btn span {
	font-size: 1.2rem;
	margin-right: 3px;
}

.add-btn:hover {
	background: #4f46e5;
	transform: translateY(-1px);
}

/* Search */

.search-wrapper {
	position: relative;
	margin-bottom: 1rem;
}

.search-icon {
	position: absolute;
	left: 1rem;
	top: 50%;
	transform: translateY(-50%);
	color: #9ca3af;
	font-size: 1.2rem;
}

.search-input {
	width: 100%;
	padding: 0.8rem 1rem 0.8rem 2.5rem;
	border: 1px solid #e5e7eb;
	border-radius: 10px;
	background: white;
	font-size: 0.95rem;
	outline: none;
	transition: 0.2s ease;
}

/* Filters */

.filters {
	display: flex;
	gap: 0.5rem;
	flex-wrap: wrap;
	margin-bottom: 1rem;
}

.filters button {
	padding: 0.45rem 0.9rem;
	border-radius: 999px;
	border: 1px solid #e5e7eb;
	background: #f9fafb;
	color: #6b7280;
	font-size: 0.85rem;
	font-weight: 500;
	cursor: pointer;
	transition: 0.2s ease;
}

.filters button:hover {
	background: #f3f4f6;
	color: #374151;
}

.filters button.active {
	background: #111827;
	color: white;
	border-color: #111827;
}

/* Task list */

.task-list {
	list-style: none;
	padding: 0;
	margin: 0;
	background: white;
	border: 1px solid #e5e7eb;
	border-radius: 14px;
	overflow: hidden;
	box-shadow: 0 8px 25px rgba(0, 0, 0, 0.05);
}

.task-list li {
	display: flex;
	align-items: center;
	gap: 0.7rem;
	padding: 0.9rem 1rem;
	border-bottom: 1px solid #f1f5f9;
	transition: background 0.2s ease;
}

.task-list li:last-child {
	border-bottom: none;
}

.task-list li:hover {
	background: #f8fafc;
}

/* Checkbox */

.checkbox {
	width: 18px;
	height: 18px;
	accent-color: #6366f1;
	cursor: pointer;
	flex-shrink: 0;
}

/* Task text */

.task-text {
	flex: 1;
	cursor: pointer;
	font-size: 0.95rem;
	color: #374151;
	transition: 0.2s ease;
}

.task-list li.done .task-text {
	text-decoration: line-through;
	color: #9ca3af;
}

/* Favorite */

.fav {
	width: 32px;
	height: 32px;
	padding: 0;
	border: none;
	background: transparent;
	color: #f59e0b;
	font-size: 1.35rem;
	cursor: pointer;
	border-radius: 8px;
	transition: 0.2s ease;
}

.fav:hover {
	background: #fffbeb;
	transform: scale(1.08);
}

/* Delete */

.delete {
	width: 32px;
	height: 32px;
	padding: 0;
	border: none;
	border-radius: 8px;
	background: transparent;
	color: #9ca3af;
	font-size: 1.4rem;
	line-height: 1;
	cursor: pointer;
	transition: 0.2s ease;
}

.delete:hover {
	background: #fef2f2;
	color: #ef4444;
}

/* Editing */

.edit .edit-input {
	flex: 1;
	width: 100%;
	padding: 0.6rem 0.7rem;
	border: 1px solid #6366f1;
	border-radius: 8px;
	font-size: 0.95rem;
	outline: none;
}

/* Empty state */

.empty-state {
	text-align: center;
	padding: 3rem 1rem;
	color: #6b7280;
}

.empty-icon {
	width: 48px;
	height: 48px;
	margin: 0 auto 1rem;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 50%;
	background: #eef2ff;
	color: #6366f1;
	font-size: 1.3rem;
}

.empty-state h3 {
	margin: 0;
	color: #374151;
}

.empty-state p {
	margin-top: 0.4rem;
	font-size: 0.9rem;
}

/* Mobile */

@media (max-width: 500px) {
	.app {
		margin: 2rem auto;
	}

	.header h1 {
		font-size: 2rem;
	}

	.input-row {
		flex-direction: column;
	}

	.add-btn {
		padding: 0.8rem;
	}
}

</style>