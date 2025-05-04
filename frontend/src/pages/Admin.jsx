import React from "react";
import AdminSidebar from "../components/AdminSidebar.jsx";
import Navbar from "../components/navbar/Navbar.jsx";
import AdminDashboard from "../components/dashboard/AdminDashboard.jsx";
import { Outlet } from "react-router-dom";

const Admin = () => {
  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 ml-64 bg-gray-100 min-h-screen">
        <Navbar />
        <Outlet />
      </div>
    </div>
  );
};

export default Admin;
