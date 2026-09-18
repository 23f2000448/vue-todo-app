// src/composables/useTasks.js

import { ref, computed, watch, onMounted } from 'vue'
import { useStorage } from './useStorage.js'

export function useTasks() {
  const storage = useStorage()
  const tasks = ref([])

  // Load from storage on mount
  onMounted(() => {
    const saved = storage.get('tasks')
    if (saved) tasks.value = saved
  })

  // Auto-save whenever tasks change
  watch(tasks, () => storage.set('tasks', tasks.value), { deep: true })

  function addTask(text, dueDate = null) {
    if (!text.trim()) return
    tasks.value.push({
      id: Date.now(),
      text: text.trim(),
      completed: false,
      favorite: false,
      createdAt: new Date().toISOString(),
      dueDate: dueDate || todayISO(), // default to today if none picked
    })
  }

  function removeTask(id) {
    tasks.value = tasks.value.filter((t) => t.id !== id)
  }

  function toggleFav(task) {
    task.favorite = !task.favorite
  }

  function updateTaskText(task, newText) {
    if (!newText.trim()) {
      removeTask(task.id)
    } else {
      task.text = newText.trim()
    }
  }

  function todayISO() {
    return new Date().toISOString().slice(0, 10)
  }

  // Tasks grouped by dueDate for the calendar
  const tasksByDate = computed(() => {
    const map = {}
    for (const t of tasks.value) {
      const d = t.dueDate || t.createdAt?.slice(0, 10)
      if (!d) continue
      if (!map[d]) map[d] = []
      map[d].push(t)
    }
    return map
  })

  return {
    tasks,
    tasksByDate,
    addTask,
    removeTask,
    toggleFav,
    updateTaskText,
    todayISO,
  }
}