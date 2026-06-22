import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { User } from '../../types/user'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('authToken'),
  isAuthenticated: !!localStorage.getItem('authToken'),
  loading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload
      state.isAuthenticated = true
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload
      localStorage.setItem('authToken', action.payload)
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      localStorage.removeItem('authToken')
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

export const { setLoading, setUser, setToken, logout, setError } = authSlice.actions
export default authSlice.reducer
