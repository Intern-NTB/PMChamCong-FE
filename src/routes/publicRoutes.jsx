import { Navigate } from 'react-router-dom'
import Login from '../pages/auth/login/Login.jsx'

export const publicRoutes = [
{path: '/', element: <Navigate to="/login" replace />},
  { path: '/login', element: <Login /> },
]
