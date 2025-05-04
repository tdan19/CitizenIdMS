import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import Register from "./pages/Register";
import Officer from "./pages/Officer";
import Supervisor from "./pages/Supervisor";
import Citizen from "./pages/Citizen";
import AdminDashboard from "./components/dashboard/AdminDashboard";
import List from "./components/Admin/User/List";
import Add from "./components/Admin/User/Add";

import "./App.css";
import PrivateRoutes from "./utils/PrivateRoutes";
import RoleBasedRoutes from "./utils/RoleBasedRoutes";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin" />}></Route>
        <Route path="/login" element={<Login />}></Route>
        <Route
          path="/admin"
          element={
            <PrivateRoutes>
              <RoleBasedRoutes requiredRole={["admin"]}>
                <Admin />
              </RoleBasedRoutes>
            </PrivateRoutes>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="/admin/users" element={<List />} />
          <Route path="/admin/users/add" element={<Add />} />
        </Route>
        <Route path="/register" element={<Register />}></Route>
        <Route path="/officer" element={<Officer />}></Route>
        <Route path="/supervisor" element={<Supervisor />}></Route>
        <Route path="/citizen" element={<Citizen />}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
