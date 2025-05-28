import React from "react";
import Navbar from "../components/navbar/Navbar";
import { Outlet } from "react-router-dom";
import RegistrarSidebar from "../components/navbar/RegistrarSidebar";
const Register = () => {
  return (
    <div className="flex h-screen overflow-hidden">
      <RegistrarSidebar />
      <div className="flex-1 ml-64 flex flex-col bg-gray-100 overflow-y-auto">
        <Navbar />
        <div className="p-4 flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Register;
