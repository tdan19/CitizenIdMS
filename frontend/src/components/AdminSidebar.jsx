import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaUsersCog,
  FaCog,
  FaClipboardList,
  FaChartBar,
} from "react-icons/fa";

const AdminSidebar = () => {
  const location = useLocation();

  const navItems = [
    {
      path: "/admin",
      icon: <FaTachometerAlt />,
      title: "Dashboard",
    },
    {
      path: "/admin/users",
      icon: <FaUsersCog />,
      title: "User Management",
    },
    {
      path: "/admin/settings",
      icon: <FaCog />,
      title: "System Settings",
    },
    {
      path: "/admin/logs",
      icon: <FaClipboardList />,
      title: "Activity Logs",
    },
    {
      path: "/admin/reports",
      icon: <FaChartBar />,
      title: "System Reports",
    },
  ];

  const isActive = (path) => {
    return (
      location.pathname === path ||
      (path !== "/admin" && location.pathname.startsWith(path))
    );
  };

  return (
    <div className="w-64 bg-white shadow-sm h-screen fixed top-0 left-0 bottom-0 space-y-2">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold">Citizen-ID-Card-MS</h2>
      </div>

      <nav className="p-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={`flex items-center space-x-4 block py-2.5 px-4 rounded ${
              isActive(item.path)
                ? "bg-blue-50 text-blue-600 font-medium"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.title}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default AdminSidebar;
