import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import ViewProfile from "./ViewProfile";
import {
  Eye,
  Pencil,
  Trash2,
  UserPlus,
  Users,
  Filter,
  Search,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";

const CitizenList = () => {
  const [citizens, setCitizens] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGender, setSelectedGender] = useState("all");
  const [selectedCitizens, setSelectedCitizens] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCitizen, setSelectedCitizen] = useState(null);
  const navigate = useNavigate();

  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  const fetchCitizens = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        "http://localhost:5000/api/citizens",
        getAuthHeader()
      );
      const responseData = response.data;

      if (!responseData.success) {
        throw new Error(responseData.message || "Failed to fetch citizens");
      }

      setCitizens(responseData.data);
    } catch (error) {
      console.error("Error fetching citizens:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        setError(error.message || "Failed to load citizens. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteCitizen = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this citizen?"
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(
        `http://localhost:5000/api/citizens/${id}`,
        getAuthHeader()
      );
      fetchCitizens();
      alert("Citizen deleted successfully");
    } catch (error) {
      console.error("Error deleting citizen:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        alert(error.response?.data?.message || "Failed to delete citizen");
      }
    }
  };

  const sendCitizenData = async (citizenIds) => {
    try {
      // Filter out only citizens with "waiting" status
      const citizensToSend = citizenIds.filter((citizenId) => {
        const citizen = citizens.find((c) => c._id === citizenId);
        return citizen && citizen.status === "waiting";
      });

      if (citizensToSend.length === 0) {
        alert("No citizens with 'waiting' status selected.");
        return;
      }

      // Send the filtered citizens
      await axios.post(
        "http://localhost:5000/api/citizens/send",
        { citizenIds: citizensToSend },
        getAuthHeader()
      );

      alert(
        `${citizensToSend.length} citizen(s) sent to supervisor successfully!`
      );
      fetchCitizens();
      setSelectedCitizens([]); // Clear the selected citizens after sending
    } catch (error) {
      console.error("Error sending citizen data:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        alert(
          `Failed to send data. Error: ${
            error.response?.data?.message || error.message
          }`
        );
      }
    }
  };

  const handleEdit = (citizen) => {
    navigate(`/registrar/edit/${citizen._id}`);
  };

  const handleSelectAll = () => {
    const eligibleCitizens = filteredCitizens.filter(
      (c) => c.status === "waiting"
    );
    if (selectedCitizens.length === eligibleCitizens.length) {
      setSelectedCitizens([]);
    } else {
      setSelectedCitizens(eligibleCitizens.map((c) => c._id));
    }
  };

  const handleSelectCitizen = (citizenId) => {
    const selectedCitizen = citizens.find((c) => c._id === citizenId);
    if (selectedCitizen && selectedCitizen.status === "waiting") {
      setSelectedCitizens((prev) =>
        prev.includes(citizenId)
          ? prev.filter((id) => id !== citizenId)
          : [...prev, citizenId]
      );
    }
  };

  const filteredCitizens = citizens.filter((citizen) => {
    const nameMatch = `${citizen.firstName || ""} ${citizen.middleName || ""} ${
      citizen.lastName || ""
    }`
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

  const handleViewProfile = (citizen) => {
    setSelectedCitizen(citizen);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-stone-100">
        <Loader2 className="animate-spin w-12 h-12 text-stone-500" />
      </div>
    );
  }

  if (error) {
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
  }

  return (
    <div className="p-6 bg-stone-100 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-stone-700" />
          <h1 className="text-3xl font-extrabold text-stone-800 tracking-tight">
            Manage Citizens
          </h1>
        </div>
        <Link
          to="/registrar/register"
          className="inline-flex items-center gap-2 bg-stone-800 text-white px-5 py-2.5 rounded-lg font-semibold shadow hover:bg-stone-700 transition"
        >
          <UserPlus className="w-5 h-5" />
          Register Citizen
        </Link>
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
            <option value="waiting">Waiting</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {selectedCitizens.length > 0 && (
          <button
            onClick={() => sendCitizenData(selectedCitizens)}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold shadow hover:bg-blue-700 transition"
          >
            <CheckCircle2 className="w-5 h-5" />
            Send Selected ({selectedCitizens.length})
          </button>
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
                      filteredCitizens.filter((c) => c.status === "waiting")
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
            {filteredCitizens.map((c, index) => (
              <tr key={c._id} className="hover:bg-stone-50 transition">
                <td className="px-4 py-2">{index + 1}</td>
                <td className="px-4 py-2">
                  {c.status === "waiting" && (
                    <input
                      type="checkbox"
                      checked={selectedCitizens.includes(c._id)}
                      onChange={() => handleSelectCitizen(c._id)}
                    />
                  )}
                </td>
                <td className="px-4 py-2 font-mono text-stone-700">
                  {c.citizen_id}
                </td>
                <td className="px-4 py-2 text-stone-800 font-semibold">
                  {c.firstName} {c.middleName} {c.lastName}
                </td>
                <td className="px-4 py-2 text-stone-700">{c.gender}</td>
                <td className="px-4 py-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      c.status === "waiting"
                        ? "bg-stone-200 text-stone-800"
                        : c.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : c.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {c.status}
                  </span>
                </td>
                <td className="px-4 py-2 space-x-2">
                  <button
                    onClick={() => handleViewProfile(c)}
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium transition"
                    title="View"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  {["waiting"].includes(c.status) && (
                    <button
                      onClick={() => handleEdit(c)}
                      className="inline-flex items-center gap-1 text-yellow-600 hover:text-yellow-800 font-medium transition"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                      Edit
                    </button>
                  )}

                  {["waiting", "rejected"].includes(c.status) && (
                    <button
                      onClick={() => deleteCitizen(c._id)}
                      className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 font-medium transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filteredCitizens.length === 0 && (
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
        onEdit={handleEdit}
        onDelete={deleteCitizen}
        onSend={sendCitizenData}
      />
    </div>
  );
};

export default CitizenList;
