import { configureStore } from '@reduxjs/toolkit'
import notesReducer from './slices/notesSlice'
import notebooksReducer from './slices/notebooksSlice'
import authReducer from './slices/authSlice'

const store = configureStore({
  reducer: {
    notes: notesReducer,
    notebooks: notebooksReducer,
    auth: authReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store
