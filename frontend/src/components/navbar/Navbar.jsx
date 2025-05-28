import React from "react";
import { LogOut, User } from "lucide-react";

const Navbar = ({ user }) => {
  let displayName = "";
  let role = "";

  if (typeof user === "object" && user !== null) {
    // Use firstName and lastName if available
    if (user.firstName && user.lastName) {
      displayName = `${user.firstName} ${user.lastName}`;
    } else if (user.username) {
      displayName = user.username;
    } else {
      displayName = "User";
    }
    role = user.role || "";
  } else if (typeof user === "string" && user.trim() !== "") {
    displayName = user;
  }

  return (
    <nav
      className="bg-gray-800 text-white p-4 shadow-xl border-b border-gray-700"
      aria-label="Main navigation"
    >
      <div className="container mx-auto flex justify-between items-center max-w-screen-xl">
        {/* Welcome Text */}
        <div className="flex items-center gap-2 text-lg font-medium">
          <User className="w-5 h-5 text-gray-300" />
          <span className="text-gray-100">
            Welcome
            {displayName && <span className="text-white">, {displayName}</span>}
            {role && (
              <span className="ml-2 text-gray-400 text-base font-normal">
                ({role.charAt(0).toUpperCase() + role.slice(1)})
              </span>
            )}
          </span>
        </div>

        {/* Optional: Add notification/action icons here */}
        <div className="flex items-center gap-4">
          {/* Example notification bell (uncomment if needed) */}
          {/* <button className="p-1 rounded-full hover:bg-gray-700 transition">
          <Bell className="w-5 h-5 text-gray-300" />
        </button> */}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
