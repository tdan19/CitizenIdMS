import { User } from "lucide-react";
import React from "react";
import { FaUser, FaUserTie, FaIdCard, FaUserShield } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const RoleSelection = () => {
  const navigate = useNavigate();

  const roles = [
    { name: "Admin", icon: <User /> },
    { name: "Citizen", icon: <FaUser /> },
    { name: "Registrar", icon: <FaIdCard /> },
    { name: "Officer", icon: <FaUserTie /> },
    { name: "Supervisor", icon: <FaUserShield /> },
  ];

  const handleRoleSelect = (role) => {
      if (role === "Citizen") {
       navigate("/citizen");
    } else {
       navigate(`/login?role=${role.toLowerCase()}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Citizens ID <span className="text-black">Management System</span>
        </h1>
        <p className="text-gray-600 mt-2 text-lg">Select Your Role to Continue</p>
      </div>

      {/* Card */}
      <div className="bg-gray-50 shadow-lg rounded-lg p-8 w-[380px]">
        <h2 className="text-xl font-semibold text-center mb-6">Choose Role</h2>
        <div className="grid grid-cols-1 gap-4">
          {roles.map((role) => (
            <button
              key={role.name}
              onClick={() => handleRoleSelect(role.name)}
              className="flex items-center justify-center gap-3 px-4 py-3 
                         bg-gradient-to-r from-gray-700 to-gray-900 
                         text-white font-medium rounded-lg shadow 
                         hover:from-gray-800 hover:to-black transition"
            >
              {role.icon} {role.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
