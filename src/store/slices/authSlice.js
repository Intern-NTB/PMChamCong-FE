import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  isLoggedIn: false,
  userUsername: '',
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action) => {
      state.isLoggedIn = true
      state.userUsername = action.payload.username
    },
    logout: (state) => {
      state.isLoggedIn = false
      state.userUsername = ''
    }
  }
})

export const { login, logout } = authSlice.actions
export default authSlice.reducer
