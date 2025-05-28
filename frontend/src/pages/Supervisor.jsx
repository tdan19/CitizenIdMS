import React from "react";
import Navbar from "../components/navbar/Navbar";
import { Outlet } from "react-router-dom";
import SupervisorSidebar from "../components/navbar/SupervisorSidebar";
const Supervisor = () => {
  return (
    <div className="flex h-screen overflow-hidden">
      <SupervisorSidebar />
      <div className="flex-1 ml-64 flex flex-col bg-gray-100 overflow-y-auto">
        <Navbar />
        <div className="p-4 flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Supervisor;
