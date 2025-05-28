import React, { useEffect, useState } from "react";
import axios from "axios";
import ViewProfile from "../Registrar/ViewProfile";
import { XCircle, Eye, ThumbsUp, ThumbsDown, Loader2 } from "lucide-react";

const Review = () => {
  const [citizens, setCitizens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCitizen, setSelectedCitizen] = useState(null);

  // Fetch only citizens with status "pending"
  const fetchCitizens = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:5000/api/registration"
      );
      const responseData = response.data;

      if (!responseData.success) throw new Error(responseData.message);

      const filtered = responseData.data.filter((c) => c.status === "pending");
      setCitizens(filtered);
    } catch (err) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveCitizen = async (citizenId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first");
      window.location.href = "/login";
      return;
    }
    try {
      const response = await axios.post(
        "http://localhost:5000/api/registration/approve",
        { citizenIds: [citizenId] },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        alert("Approval successful!");
        fetchCitizens();
      } else {
        alert("Approval failed.");
      }
    } catch {
      alert("Approval failed. Please try again.");
    }
  };

  const handleRejectCitizen = async (citizenId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first");
      window.location.href = "/login";
      return;
    }
    try {
      const response = await axios.post(
        "http://localhost:5000/api/registration/reject",
        { citizenIds: [citizenId] },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        alert("Citizen rejected");
        fetchCitizens();
      } else {
        alert("Rejection failed.");
      }
    } catch {
      alert("Rejection failed. Please try again.");
    }
  };

  useEffect(() => {
    fetchCitizens();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-stone-100">
        <Loader2 className="animate-spin w-12 h-12 text-stone-500" />
      </div>
    );
  if (error)
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative flex items-center gap-4">
          <XCircle className="w-6 h-6 text-red-500" />
          {error}
          <button
            onClick={fetchCitizens}
            className="bg-red-500 text-white px-3 py-1 rounded ml-4"
          >
            Retry
          </button>
        </div>
      </div>
    );

  return (
    <div className="p-6 bg-stone-100 min-h-screen">
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-3xl font-extrabold text-stone-800 tracking-tight">
          Pending Applications
        </h1>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-x-auto border border-stone-200">
        <table className="min-w-full text-sm">
          <thead className="bg-stone-100">
            <tr>
              <th className="px-4 py-2 text-left font-semibold text-stone-500">
                S/N
              </th>
              <th className="px-4 py-2 text-left font-semibold text-stone-500">
                Citizen ID
              </th>
              <th className="px-4 py-2 text-left font-semibold text-stone-500">
                Full Name
              </th>
              <th className="px-4 py-2 text-left font-semibold text-stone-500">
                Gender
              </th>
              <th className="px-4 py-2 text-left font-semibold text-stone-500">
                Status
              </th>
              <th className="px-4 py-2 text-left font-semibold text-stone-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {citizens.length > 0 ? (
              citizens.map((citizen, index) => (
                <tr key={citizen._id} className="hover:bg-stone-50 transition">
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2 font-mono text-stone-700">
                    {citizen.citizen_id}
                  </td>
                  <td className="px-4 py-2 text-stone-800 font-semibold">
                    {citizen.firstName} {citizen.middleName} {citizen.lastName}
                  </td>
                  <td className="px-4 py-2 text-stone-700">{citizen.gender}</td>
                  <td className="px-4 py-2">
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                      {citizen.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 space-x-2">
                    <button
                      onClick={() => {
                        setSelectedCitizen(citizen);
                        setIsModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium transition"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    <button
                      onClick={() => handleApproveCitizen(citizen._id)}
                      className="inline-flex items-center gap-1 text-green-600 hover:text-green-800 font-medium transition"
                      title="Approve"
                    >
                      <ThumbsUp className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectCitizen(citizen._id)}
                      className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 font-medium transition"
                      title="Reject"
                    >
                      <ThumbsDown className="w-4 h-4" />
                      Reject
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className="text-center px-4 py-6 text-stone-400"
                >
                  No pending citizens found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ViewProfile
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        citizen={selectedCitizen}
      />
    </div>
  );
};

export default Review;
