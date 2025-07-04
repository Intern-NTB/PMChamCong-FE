// src/routes/publicRoutes.jsx
import { Navigate } from "react-router-dom";
import Login from "../pages/auth/login/Login.jsx";
import GiayNghiPhep from "../pages/giaynghiphep/giaynghiphep.jsx";

export const publicRoutes = [
  { path: "/", element: <Navigate to="/login" replace /> },
  { path: "/login", element: <Login /> },
  { path: "/giaynghiphep", element: <GiayNghiPhep /> },
];
