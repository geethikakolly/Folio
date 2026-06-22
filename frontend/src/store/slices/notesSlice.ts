import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { Note } from '../../types/note'

interface NotesState {
  items: Note[]
  loading: boolean
  error: string | null
}

const initialState: NotesState = {
  items: [],
  loading: false,
  error: null,
}

const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setNotes: (state, action: PayloadAction<Note[]>) => {
      state.items = action.payload
    },
    addNote: (state, action: PayloadAction<Note>) => {
      state.items.push(action.payload)
    },
    updateNote: (state, action: PayloadAction<Note>) => {
      const index = state.items.findIndex(note => note.id === action.payload.id)
      if (index > -1) {
        state.items[index] = action.payload
      }
    },
    deleteNote: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(note => note.id !== action.payload)
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

export const {
  setLoading,
  setNotes,
  addNote,
  updateNote,
  deleteNote,
  setError,
} = notesSlice.actions
export default notesSlice.reducer
