<!-- src/components/DayModal.vue -->
<template>
  <Teleport to="body">
    <div class="overlay" @click.self="$emit('close')">
      <div class="modal">
        <!-- Header -->
        <div class="modal-header">
          <div>
            <p class="modal-date-label">{{ dateLabel }}</p>
            <span class="modal-badge" :class="dayType">{{ dayType }}</span>
          </div>
          <button class="close-btn" @click="$emit('close')">×</button>
        </div>

        <!-- Add task (only on today / future) -->
        <div v-if="dayType !== 'past'" class="add-row">
          <input
            v-model="newText"
            type="text"
            placeholder="Add a task for this day…"
            @keydown.enter="handleAdd"
          />
          <button class="add-btn" @click="handleAdd">Add</button>
        </div>

        <!-- Task sections -->
        <div v-if="tasks.length === 0" class="empty-msg">No tasks for this day.</div>

        <template v-else>
          <!-- Completed -->
          <div v-if="completedTasks.length" class="section">
            <div class="section-title done-title">✓ Completed ({{ completedTasks.length }})</div>
            <ul class="task-list">
              <li v-for="t in completedTasks" :key="t.id" class="task-item done-item">
                <input
                  class="checkbox"
                  type="checkbox"
                  :checked="t.completed"
                  :disabled="dayType === 'past'"
                  @change="$emit('toggle-complete', t)"
                />
                <span class="task-text done-text">{{ t.text }}</span>
                <button
                  v-if="dayType !== 'past'"
                  class="del-btn"
                  @click="$emit('remove-task', t.id)"
                >×</button>
              </li>
            </ul>
          </div>

          <!-- Pending -->
          <div v-if="pendingTasks.length" class="section">
            <div class="section-title pending-title">⏳ Pending ({{ pendingTasks.length }})</div>
            <ul class="task-list">
              <li v-for="t in pendingTasks" :key="t.id" class="task-item">
                <input
                  class="checkbox"
                  type="checkbox"
                  :checked="t.completed"
                  :disabled="dayType === 'past'"
                  @change="$emit('toggle-complete', t)"
                />
                <!-- Inline edit for today/future -->
                <template v-if="dayType !== 'past' && editingId === t.id">
                  <input
                    v-model="editBuffer"
                    class="edit-input"
                    @keydown.enter="finishEdit(t)"
                    @keydown.esc="cancelEdit"
                    @blur="finishEdit(t)"
                    :ref="(el) => el && el.focus()"
                  />
                </template>
                <span
                  v-else
                  class="task-text"
                  @click="dayType !== 'past' && startEdit(t)"
                  :class="{ editable: dayType !== 'past' }"
                >{{ t.text }}</span>
                <button
                  v-if="dayType !== 'past'"
                  class="del-btn"
                  @click="$emit('remove-task', t.id)"
                >×</button>
              </li>
            </ul>
          </div>
        </template>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  date: { type: String, required: true },    // YYYY-MM-DD
  tasks: { type: Array, default: () => [] },
  todayISO: { type: String, required: true },
})

const emit = defineEmits(['close', 'add-task', 'remove-task', 'toggle-complete', 'update-task'])

// ── helpers ──────────────────────────────────────────────
const dayType = computed(() => {
  if (props.date < props.todayISO) return 'past'
  if (props.date === props.todayISO) return 'today'
  return 'future'
})

const dateLabel = computed(() => {
  // Parse as local date to avoid timezone offset shifting the day
  const [y, m, d] = props.date.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
})

const completedTasks = computed(() => props.tasks.filter((t) => t.completed))
const pendingTasks = computed(() => props.tasks.filter((t) => !t.completed))

// ── add ───────────────────────────────────────────────────
const newText = ref('')
function handleAdd() {
  if (!newText.value.trim()) return
  emit('add-task', newText.value.trim(), props.date)
  newText.value = ''
}

// ── inline edit ───────────────────────────────────────────
const editingId = ref(null)
const editBuffer = ref('')

function startEdit(task) {
  editingId.value = task.id
  editBuffer.value = task.text
}
function cancelEdit() {
  editingId.value = null
}
function finishEdit(task) {
  if (editingId.value !== task.id) return
  emit('update-task', task, editBuffer.value)
  editingId.value = null
}
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal {
  background: white;
  border-radius: 16px;
  width: min(100%, 480px);
  max-height: 80vh;
  overflow-y: auto;
  padding: 1.5rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.2rem;
}

.modal-date-label {
  margin: 0 0 0.3rem;
  font-weight: 700;
  font-size: 1.05rem;
  color: #111827;
}

.modal-badge {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: capitalize;
  letter-spacing: 0.04em;
}

.modal-badge.past    { background: #f1f5f9; color: #64748b; }
.modal-badge.today   { background: #eef2ff; color: #6366f1; }
.modal-badge.future  { background: #f0fdf4; color: #16a34a; }

.close-btn {
  border: none;
  background: #f3f4f6;
  border-radius: 8px;
  width: 32px;
  height: 32px;
  font-size: 1.3rem;
  cursor: pointer;
  color: #6b7280;
  line-height: 1;
  transition: background 0.15s;
}
.close-btn:hover { background: #e5e7eb; }

/* Add row */
.add-row {
  display: flex;
  gap: 0.6rem;
  margin-bottom: 1.2rem;
}
.add-row input {
  flex: 1;
  padding: 0.7rem 0.9rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.92rem;
  outline: none;
  font-family: inherit;
  transition: border-color 0.15s;
}
.add-row input:focus { border-color: #6366f1; }

.add-btn {
  padding: 0 1rem;
  border: none;
  border-radius: 8px;
  background: #6366f1;
  color: white;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.15s;
}
.add-btn:hover { background: #4f46e5; }

/* Sections */
.section { margin-top: 1rem; }

.section-title {
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
  padding-bottom: 0.3rem;
  border-bottom: 1px solid #f1f5f9;
}
.done-title    { color: #22c55e; }
.pending-title { color: #f59e0b; }

/* Task list */
.task-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 0.7rem;
  border-radius: 8px;
  background: #f9fafb;
}

.checkbox {
  width: 16px;
  height: 16px;
  accent-color: #6366f1;
  cursor: pointer;
  flex-shrink: 0;
}
.checkbox:disabled { opacity: 0.5; cursor: default; }

.task-text {
  flex: 1;
  font-size: 0.9rem;
  color: #374151;
}
.task-text.editable { cursor: pointer; }
.task-text.editable:hover { color: #6366f1; }
.done-text { text-decoration: line-through; color: #9ca3af; }

.edit-input {
  flex: 1;
  padding: 0.3rem 0.5rem;
  border: 1px solid #6366f1;
  border-radius: 6px;
  font-size: 0.9rem;
  outline: none;
  font-family: inherit;
}

.del-btn {
  border: none;
  background: transparent;
  color: #9ca3af;
  font-size: 1.2rem;
  cursor: pointer;
  border-radius: 6px;
  width: 26px;
  height: 26px;
  padding: 0;
  transition: background 0.15s, color 0.15s;
}
.del-btn:hover { background: #fef2f2; color: #ef4444; }

.empty-msg {
  text-align: center;
  padding: 1.5rem 0;
  color: #9ca3af;
  font-size: 0.9rem;
}
</style>