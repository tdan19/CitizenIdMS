import React from "react";
import Navbar from "../components/navbar/Navbar";
import { Outlet } from "react-router-dom";
import OfficerSidebar from "../components/navbar/OfficerSidebar";
const Officer = () => {
  return (
    <div className="flex h-screen overflow-hidden">
      <OfficerSidebar />
      <div className="flex-1 ml-64 flex flex-col bg-gray-100 overflow-y-auto">
        <Navbar />
        <div className="p-4 flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Officer;
