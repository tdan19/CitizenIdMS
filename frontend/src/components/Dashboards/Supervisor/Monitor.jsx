import React, { useEffect, useState } from "react";
import axios from "axios";
import ViewProfile from "../Registrar/ViewProfile";
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Loader2,
} from "lucide-react";

const Monitor = () => {
  // Removed unused 'user' variable
  const [citizens, setCitizens] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGender, setSelectedGender] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCitizens, setSelectedCitizens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCitizen, setSelectedCitizen] = useState(null);

  const fetchCitizens = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:5000/api/registration"
      );
      const responseData = response.data;

      if (!responseData.success) throw new Error(responseData.message);

      const filtered = responseData.data.filter((c) =>
        ["pending", "approved", "rejected"].includes(c.status)
      );

      setCitizens(filtered);
    } catch (err) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveCitizens = async (citizenIds) => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first");
      window.location.href = "/login";
      return;
    }

    try {
      // Only send citizenIds - backend will get user ID from token
      const response = await axios.post(
        "http://localhost:5000/api/registration/approve",
        { citizenIds }, // Remove supervisorId from body
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
        setSelectedCitizens([]);
      } else {
        const failed = response.data.results?.filter((r) => !r.success);
        if (failed?.length) {
          alert(`Failed approvals: ${failed.map((f) => f.id).join(", ")}`);
        }
      }
    } catch (error) {
      console.error("Approval error:", error.response?.data || error.message);

      if (error.response?.status === 403) {
        alert("Permission denied. Please check your account privileges.");
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else {
        alert("Approval failed. Please try again.");
      }
    }
  };

  const handleRejectCitizens = async (citizenIds) => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first");
      window.location.href = "/login";
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/registration/reject",
        { citizenIds }, // Only send citizenIds, no reason
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        alert(`${citizenIds.length} citizen(s) rejected`);
        fetchCitizens();
        setSelectedCitizens([]);
      } else {
        const failed = response.data.results?.filter((r) => !r.success);
        if (failed?.length) {
          alert(`Failed to reject: ${failed.map((f) => f.id).join(", ")}`);
        }
      }
    } catch (error) {
      console.error("Rejection error:", error.response?.data || error.message);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else {
        alert("Rejection failed. Please try again.");
      }
    }
  };

  // Update the single rejection handler to match
  const handleRejectCitizen = async (citizenId) => {
    handleRejectCitizens([citizenId]);
  };

  const handleApproveCitizen = async (citizenId) => {
    handleApproveCitizens([citizenId]);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allPendingIds = filteredCitizens
        .filter((c) => c.status === "pending")
        .map((c) => c._id);
      setSelectedCitizens(allPendingIds);
    } else {
      setSelectedCitizens([]);
    }
  };

  const handleSelectCitizen = (citizenId) => {
    setSelectedCitizens((prev) =>
      prev.includes(citizenId)
        ? prev.filter((id) => id !== citizenId)
        : [...prev, citizenId]
    );
  };

  const filteredCitizens = citizens.filter((citizen) => {
    const nameMatch =
      `${citizen.firstName} ${citizen.middleName} ${citizen.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const genderMatch =
      selectedGender === "all" || citizen.gender === selectedGender;

    const statusMatch =
      selectedStatus === "all" || citizen.status === selectedStatus;

    return nameMatch && genderMatch && statusMatch;
  });

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
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-stone-700" />
          <h1 className="text-3xl font-extrabold text-stone-800 tracking-tight">
            Monitor Status
          </h1>
        </div>
      </div>

      {/* Filters and Buttons */}
      <div className="flex flex-wrap items-end gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-stone-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name"
            className="pl-10 pr-4 py-2 border border-stone-300 rounded-lg bg-white text-stone-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-400 w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-3 text-stone-400 w-5 h-5" />
          <select
            className="pl-10 pr-4 py-2 border border-stone-300 rounded-lg bg-white text-stone-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
            value={selectedGender}
            onChange={(e) => setSelectedGender(e.target.value)}
          >
            <option value="all">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-3 text-stone-400 w-5 h-5" />
          <select
            className="pl-10 pr-4 py-2 border border-stone-300 rounded-lg bg-white text-stone-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        {selectedCitizens.length > 0 && (
          <>
            <button
              onClick={() => handleApproveCitizens(selectedCitizens)}
              className="inline-flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-lg font-semibold shadow hover:bg-green-700 transition"
            >
              <CheckCircle2 className="w-5 h-5" />
              Approve Selected ({selectedCitizens.length})
            </button>
            <button
              onClick={() => handleRejectCitizens(selectedCitizens)}
              className="inline-flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-lg font-semibold shadow hover:bg-red-700 transition"
            >
              <XCircle className="w-5 h-5" />
              Reject Selected
            </button>
          </>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-x-auto border border-stone-200">
        <table className="min-w-full text-sm">
          <thead className="bg-stone-100">
            <tr>
              <th className="px-4 py-2 text-left font-semibold text-stone-500">
                S/N
              </th>
              <th className="px-4 py-2 text-left">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={
                    selectedCitizens.length > 0 &&
                    selectedCitizens.length ===
                      filteredCitizens.filter((c) => c.status === "pending")
                        .length
                  }
                />
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
            {filteredCitizens.length > 0 ? (
              filteredCitizens.map((citizen, index) => (
                <tr key={citizen._id} className="hover:bg-stone-50 transition">
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2">
                    {citizen.status === "pending" && (
                      <input
                        type="checkbox"
                        checked={selectedCitizens.includes(citizen._id)}
                        onChange={() => handleSelectCitizen(citizen._id)}
                      />
                    )}
                  </td>
                  <td className="px-4 py-2 font-mono text-stone-700">
                    {citizen.citizen_id}
                  </td>
                  <td className="px-4 py-2 text-stone-800 font-semibold">
                    {citizen.firstName} {citizen.middleName} {citizen.lastName}
                  </td>
                  <td className="px-4 py-2 text-stone-700">{citizen.gender}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        citizen.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : citizen.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
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
                    {citizen.status === "pending" && (
                      <>
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
                      </>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="text-center px-4 py-6 text-stone-400"
                >
                  No matching citizens found.
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

export default Monitor;
