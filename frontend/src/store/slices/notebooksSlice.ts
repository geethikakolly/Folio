import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { Notebook } from '../../types/notebook'

interface NotebooksState {
  items: Notebook[]
  loading: boolean
  error: string | null
}

const initialState: NotebooksState = {
  items: [],
  loading: false,
  error: null,
}

const notebooksSlice = createSlice({
  name: 'notebooks',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setNotebooks: (state, action: PayloadAction<Notebook[]>) => {
      state.items = action.payload
    },
    addNotebook: (state, action: PayloadAction<Notebook>) => {
      state.items.push(action.payload)
    },
    updateNotebook: (state, action: PayloadAction<Notebook>) => {
      const index = state.items.findIndex(nb => nb.id === action.payload.id)
      if (index > -1) {
        state.items[index] = action.payload
      }
    },
    deleteNotebook: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(nb => nb.id !== action.payload)
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

export const {
  setLoading,
  setNotebooks,
  addNotebook,
  updateNotebook,
  deleteNotebook,
  setError,
} = notebooksSlice.actions
export default notebooksSlice.reducer
