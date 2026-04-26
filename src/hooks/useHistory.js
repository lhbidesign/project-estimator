import { useReducer, useCallback } from 'react'

function reducer(state, action) {
  switch (action.type) {
    case 'PUSH': {
      const past = [...state.past.slice(-99), state.present]
      return { past, present: action.payload, future: [] }
    }
    case 'UNDO': {
      if (!state.past.length) return state
      return {
        past:    state.past.slice(0, -1),
        present: state.past[state.past.length - 1],
        future:  [state.present, ...state.future],
      }
    }
    case 'REDO': {
      if (!state.future.length) return state
      return {
        past:    [...state.past, state.present],
        present: state.future[0],
        future:  state.future.slice(1),
      }
    }
    case 'RESET':
      return { past: [], present: action.payload, future: [] }
    default:
      return state
  }
}

export function useHistory(initial) {
  const [{ past, present, future }, dispatch] = useReducer(reducer, {
    past: [], present: initial, future: [],
  })

  const push  = useCallback(v => dispatch({ type: 'PUSH', payload: v }), [])
  const undo  = useCallback(()  => dispatch({ type: 'UNDO' }), [])
  const redo  = useCallback(()  => dispatch({ type: 'REDO' }), [])
  const reset = useCallback(v => dispatch({ type: 'RESET', payload: v }), [])

  return {
    sections: present,
    push, undo, redo, reset,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
  }
}
