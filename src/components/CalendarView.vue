<!-- src/components/CalendarView.vue -->
<template>
  <div class="calendar">
    <!-- Month nav -->
    <div class="cal-header">
      <button class="nav-btn" @click="prevMonth">‹</button>
      <span class="month-label">{{ monthLabel }}</span>
      <button class="nav-btn" @click="nextMonth">›</button>
    </div>

    <!-- Day-of-week headings -->
    <div class="cal-grid">
      <div class="dow" v-for="d in dayNames" :key="d">{{ d }}</div>

      <!-- Empty cells before month starts -->
      <div v-for="n in startOffset" :key="'e' + n" class="cal-cell empty" />

      <!-- Day cells -->
      <div
        v-for="day in daysInMonth"
        :key="day.iso"
        class="cal-cell"
        :class="{
          today: day.iso === todayISO,
          past: day.iso < todayISO,
          future: day.iso > todayISO,
          'has-tasks': hasTasks(day.iso),
          'has-done': hasCompleted(day.iso),
          'has-pending': hasPending(day.iso),
        }"
        @click="$emit('day-click', day.iso)"
      >
        <span class="day-num">{{ day.num }}</span>
        <span v-if="hasTasks(day.iso)" class="dot-row">
          <span v-if="hasCompleted(day.iso)" class="dot done-dot" />
          <span v-if="hasPending(day.iso)" class="dot pending-dot" />
        </span>
      </div>
    </div>

    <!-- Legend -->
    <div class="legend">
      <span><span class="dot done-dot" /> Completed</span>
      <span><span class="dot pending-dot" /> Pending</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  tasksByDate: { type: Object, default: () => ({}) },
  todayISO: { type: String, required: true },
})

defineEmits(['day-click'])

// Current display month/year
const now = new Date()
const viewYear = ref(now.getFullYear())
const viewMonth = ref(now.getMonth()) // 0-indexed

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const monthLabel = computed(() => {
  return new Date(viewYear.value, viewMonth.value, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
})

// Day cells for the current view month
const daysInMonth = computed(() => {
  const count = new Date(viewYear.value, viewMonth.value + 1, 0).getDate()
  return Array.from({ length: count }, (_, i) => {
    const d = i + 1
    const iso = `${viewYear.value}-${String(viewMonth.value + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    return { num: d, iso }
  })
})

// How many empty cells before day 1
const startOffset = computed(() => {
  return new Date(viewYear.value, viewMonth.value, 1).getDay()
})

function prevMonth() {
  if (viewMonth.value === 0) {
    viewMonth.value = 11
    viewYear.value--
  } else {
    viewMonth.value--
  }
}

function nextMonth() {
  if (viewMonth.value === 11) {
    viewMonth.value = 0
    viewYear.value++
  } else {
    viewMonth.value++
  }
}

function hasTasks(iso) {
  return (props.tasksByDate[iso]?.length ?? 0) > 0
}
function hasCompleted(iso) {
  return props.tasksByDate[iso]?.some((t) => t.completed) ?? false
}
function hasPending(iso) {
  return props.tasksByDate[iso]?.some((t) => !t.completed) ?? false
}
</script>

<style scoped>
.calendar {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 1.2rem;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.05);
  margin-bottom: 1.5rem;
}

.cal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.month-label {
  font-weight: 700;
  font-size: 1rem;
  color: #111827;
}

.nav-btn {
  border: none;
  background: #f3f4f6;
  border-radius: 8px;
  width: 32px;
  height: 32px;
  font-size: 1.2rem;
  cursor: pointer;
  color: #374151;
  transition: background 0.15s;
}

.nav-btn:hover {
  background: #e5e7eb;
}

.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.dow {
  text-align: center;
  font-size: 0.72rem;
  font-weight: 600;
  color: #9ca3af;
  padding-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.cal-cell {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  transition: background 0.15s;
  gap: 2px;
}

.cal-cell:hover:not(.empty) {
  background: #f3f4f6;
}

.cal-cell.empty {
  cursor: default;
}

.cal-cell.today {
  background: #6366f1;
  color: white;
}

.cal-cell.today:hover {
  background: #4f46e5;
}

.cal-cell.today .day-num {
  color: white;
}

.cal-cell.past {
  opacity: 0.65;
}

.day-num {
  font-size: 0.85rem;
  font-weight: 500;
  color: #374151;
  line-height: 1;
}

.dot-row {
  display: flex;
  gap: 2px;
}

.dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  display: inline-block;
}

.done-dot {
  background: #22c55e;
}

.pending-dot {
  background: #f59e0b;
}

.legend {
  display: flex;
  gap: 1rem;
  margin-top: 0.8rem;
  justify-content: center;
  font-size: 0.78rem;
  color: #6b7280;
}

.legend span {
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>