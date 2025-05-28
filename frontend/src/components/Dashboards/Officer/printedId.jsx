import React, { useEffect, useState } from "react";
import axios from "axios";
import ViewProfile from "../Registrar/ViewProfile";
import QRCode from "qrcode";
import {
  Printer,
  Eye,
  CheckCircle2,
  XCircle,
  Loader2,
  Filter,
  Search,
  Users,
} from "lucide-react";

const PrintId = () => {
  const [citizens, setCitizens] = useState([]);
  const [selectedCitizen, setSelectedCitizen] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const fetchCitizens = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE}/api/registration`, {
        params: { status: "approved" },
      });
      setCitizens(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch citizens", err);
      setError("Failed to load citizens. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCitizens();
    // eslint-disable-next-line
  }, []);

  // Filter by printStatus (printed or delivered) and search term
  const filteredCitizens = citizens
    .filter(
      (c) =>
        (c.printStatus || "").toLowerCase() === "printed" ||
        (c.printStatus || "").toLowerCase() === "delivered"
    )
    .filter((c) => {
      const fullName = `${c.firstName} ${c.middleName || ""} ${
        c.lastName
      }`.toLowerCase();
      return fullName.includes(searchTerm.toLowerCase());
    });

  const handleView = (citizen) => {
    setSelectedCitizen(citizen);
    setViewOpen(true);
  };

  return (
    <div className="min-h-screen bg-stone-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <Printer className="w-8 h-8 text-stone-700" />
        <h1 className="text-3xl font-extrabold text-stone-800 text-center tracking-tight">
          Printed & Delivered ID List
        </h1>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-600 text-red-700 p-4 rounded-md shadow mb-6 flex items-center gap-2">
          <XCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Search */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-stone-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-stone-300 rounded-lg bg-white text-stone-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-400 w-64"
          />
        </div>
      </div>

      {/* Table or Spinner */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin w-12 h-12 text-stone-500" />
        </div>
      ) : filteredCitizens.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow text-center text-stone-600">
          No citizens found with printed or delivered status.
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-stone-200">
            <thead className="bg-stone-50 text-xs text-stone-500 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">S/N</th>
                <th className="px-6 py-3 text-left">Citizen ID</th>
                <th className="px-6 py-3 text-left">Full Name</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Print Status</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 text-sm">
              {filteredCitizens.map((citizen, index) => (
                <tr key={citizen._id} className="hover:bg-stone-50 transition">
                  <td className="px-4 py-4 text-stone-700">{index + 1}</td>
                  <td className="px-6 py-4 font-mono text-stone-800">
                    {citizen.citizen_id}
                  </td>
                  <td className="px-6 py-4 text-stone-800 font-semibold">
                    {citizen.firstName} {citizen.lastName}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                      {citizen.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        (citizen.printStatus || "").toLowerCase() === "printed"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {citizen.printStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleView(citizen)}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-900 text-sm font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* View Modal */}
      <ViewProfile
        isOpen={viewOpen}
        onClose={() => setViewOpen(false)}
        citizen={selectedCitizen}
      />
    </div>
  );
};

export default PrintId;
