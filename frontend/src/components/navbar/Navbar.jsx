import React from "react";
import { useAuth } from "../../context/authContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  return (
    <div className="flex items-center text-black justify-between h-12 p-4 border-b space-y-2">
      <p>Welcome {user.name}</p>
      <button
        onClick={logout}
        className="bg-gray-700 text-white px-4 py-1 rounded hover:bg-gray-800 "
      >
        Logout
      </button>
    </div>
  );
};

export default Navbar;
