// src/composables/useStorage.js

const PREFIX = 'todo-app:'

export function useStorage() {
  function get(key) {
    try {
      const raw = localStorage.getItem(PREFIX + key)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  }

  function set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value))
    } catch (e) {
      console.warn('Storage write failed:', e)
    }
  }

  function remove(key) {
    localStorage.removeItem(PREFIX + key)
  }

  return { get, set, remove }
}