import React from "react";
import { useAuth } from "../../context/AuthContext";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  IdCard,
  Printer,
  AlertTriangle,
  LogOut,
} from "lucide-react";

const OfficerSidebar = () => {
  const { user, logout } = useAuth();
  const handleLogout = () => {
    logout(); // Assumes logout() handles any necessary navigation or state cleanup
  };

  const navItems = [
    {
      path: "/officer",
      icon: <LayoutDashboard className="w-5 h-5" />,
      label: "Dashboard",
    },
    {
      path: "/officer/print-id",
      icon: <IdCard className="w-5 h-5" />,
      label: "Generate & Print IDs",
    },
    {
      path: "/officer/track-printing",
      icon: <Printer className="w-5 h-5" />,
      label: "Track Printed IDs",
    },
    {
      path: "/officer/report-issues",
      icon: <AlertTriangle className="w-5 h-5" />,
      label: "Report Print Issues",
    },
  ];
  const isActive = (path) =>
    location.pathname === path ||
    (path !== "/officer" && location.pathname.startsWith(path));

  return (
    <div className="w-64 bg-gray-800 shadow-xl h-screen fixed top-0 left-0 bottom-0 border-r border-gray-700 flex flex-col z-50">
      {/* Header with subtle gradient */}
      <div className="p-6 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-b-2xl shadow-md">
        <h2 className="text-xl font-bold tracking-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-white">
            Printing Officer
          </span>
        </h2>
      </div>

      {/* Navigation Items */}
      <ul className="space-y-1 p-2 mt-2 flex-1 overflow-y-auto">
        {navItems.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              className={() =>
                `flex items-center gap-3 py-2.5 px-3 rounded-lg transition-all duration-200 group mx-2 ${
                  isActive(item.path)
                    ? "bg-gray-700 text-white font-semibold shadow-md border-l-4 border-blue-400"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`
              }
            >
              <span
                className={`text-lg ${
                  isActive(item.path)
                    ? "text-blue-300"
                    : "text-gray-400 group-hover:text-white"
                }`}
              >
                {item.icon}
              </span>
              <span className="text-base">{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-700">
        {user && (
          <button
            className="flex items-center gap-2 w-full py-2.5 px-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-red-400 transition font-medium group"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-400 transition-colors" />
            <span>Logout</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default OfficerSidebar;
