import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  BadgeCheck,
  Heart,
  UserCircle2,
  Pencil,
  Trash2,
  ArrowLeft,
} from "lucide-react";
const UserProfile = () => {
  const { userId } = useParams(); // Get the userId from the URL params
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch user data based on the userId
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/users/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setUser(response.data.user);
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError("Failed to load user profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the profile of ${user.username}?`
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5000/api/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      alert("User deleted successfully.");
      navigate("/admin/users"); // Redirect back to the user list after deletion
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("Failed to delete user.");
    }
  };

  const handleEdit = () => {
    navigate(`/admin/edit/${userId}`); // Navigate to the edit page
  };

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white min-h-screen shadow-lg rounded-2xl border border-gray-200">
      <h2 className="text-3xl font-semibold text-gray-800 mb-10 text-center flex items-center justify-center gap-2">
        <UserCircle2 className="h-8 w-8 text-blue-600" />
        User Profile
      </h2>

      <div className="space-y-5 divide-y divide-gray-200">
        {[
          { label: "Username", value: user.username, icon: User },
          {
            label: "Full Name",
            value: `${user.firstName} ${user.lastName}`,
            icon: User,
          },
          { label: "Email", value: user.email, icon: Mail },
          { label: "Phone", value: user.phone, icon: Phone },
          { label: "Date of Birth", value: user.dateOfBirth, icon: Calendar },
          { label: "Role", value: user.role, icon: Briefcase },
          { label: "Start Date", value: user.startDate, icon: Calendar },
          { label: "Employee ID", value: user.employeeId, icon: BadgeCheck },
          { label: "Marital Status", value: user.maritalStatus, icon: Heart },
        ].map(({ label, value, icon: Icon }, idx) => (
          <div key={idx} className="flex items-start py-4">
            {Icon && (
              <Icon className="h-5 w-5 text-gray-500 mt-1 mr-3 shrink-0" />
            )}
            <div>
              <p className="text-sm font-medium text-gray-500">{label}</p>
              <p className="text-base text-gray-800 font-semibold">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
        <button
          onClick={handleEdit}
          className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
        >
          <Pencil className="w-4 h-4" />
          Edit Profile
        </button>

        <button
          onClick={handleDelete}
          className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
        >
          <Trash2 className="w-4 h-4" />
          Delete Profile
        </button>
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </button>
      </div>
    </div>
  );
};

export default UserProfile;
