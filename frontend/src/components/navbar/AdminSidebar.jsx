import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  UserCog,
  Settings,
  ClipboardList,
  LogOut,
  UserPlus,
  IdCard,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
const AdminSidebar = () => {
  const { user, logout } = useAuth();
  const handleLogout = () => {
    logout();
  };
  const location = useLocation();

  const navItems = [
    { title: "Dashboard", icon: <LayoutDashboard />, path: "/admin" },
    { title: "Add New User", icon: <UserPlus />, path: "/admin/add" },
    {
      title: "Manage User",
      icon: <UserCog />,
      path: "/admin/user-management",
    },
    { title: "Citizens List", icon: <IdCard />, path: "/admin/list" },
  ];

  const isActive = (path) =>
    location.pathname === path ||
    (path !== "/admin" && location.pathname.startsWith(path));

  return (
    <div className="w-64 h-screen fixed top-0 left-0 bg-gray-800 text-white p-4 shadow-xl border-r border-gray-700">
      <h1 className="text-xl font-bold text-white mb-8 px-2 tracking-tight">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-300 to-white">
          Admin Page
        </span>
      </h1>

      <ul className="space-y-1">
        {navItems.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              className={() =>
                `flex items-center gap-3 py-2.5 px-3 rounded-lg transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
                  isActive(item.path)
                    ? "bg-gray-700 text-white font-semibold shadow-md border-l-4 border-blue-400"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`
              }
            >
              <span
                className={`text-lg group-hover:text-white ${
                  isActive(item.path) ? "text-blue-300" : "text-gray-400"
                }`}
              >
                {item.icon}
              </span>
              <span className="text-base">{item.title}</span>
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="absolute bottom-6 left-0 w-full px-4">
        <div className="p-3">
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
    </div>
  );
};

export default AdminSidebar;
