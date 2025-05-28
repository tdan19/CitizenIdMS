// utils/RoleBasedRoutes.jsx
import React from "react";
import { Navigate } from "react-router-dom";

const RoleBasedRoutes = ({ requiredRole, children }) => {
  const token = localStorage.getItem("token");
  let user = null;

  try {
    user = token ? JSON.parse(atob(token.split(".")[1])) : null; // Decode JWT payload
  } catch (e) {
    console.error("Invalid token format", e);
    return <Navigate to="/login" />;
  }

  if (!user || !requiredRole.includes(user.role)) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default RoleBasedRoutes;
