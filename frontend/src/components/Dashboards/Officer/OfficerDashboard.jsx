import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Printer,
  XCircle,
  Loader2,
  CheckCircle2,
  Ban,
  FileDown,
  FileCheck,
  FileX2,
  Users,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#FBBF24", "#3B82F6", "#8B5CF6", "#DC2626"];

const OfficerDashboard = () => {
  const [citizens, setCitizens] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCitizens = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/registration", {
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
  }, []);

  const summaryCounts = {
    total: citizens.length,
    approved: citizens.length,
    unprinted: citizens.filter(
      (c) => (c.printStatus || "unprinted") === "unprinted"
    ).length,
    printed: citizens.filter((c) => c.printStatus === "printed").length,
    delivered: citizens.filter((c) => c.printStatus === "delivered").length,
    failed: citizens.filter((c) => c.printStatus === "failed").length,
  };

  const printStatusData = [
    { name: "Unprinted", value: summaryCounts.unprinted },
    { name: "Printed", value: summaryCounts.printed },
    { name: "Delivered", value: summaryCounts.delivered },
    { name: "Failed", value: summaryCounts.failed },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-stone-100">
        <Loader2 className="animate-spin w-12 h-12 text-stone-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <Printer className="w-8 h-8 text-stone-700" />
        <h1 className="text-3xl font-extrabold text-stone-800 tracking-tight">
          Printing Officer Dashboard
        </h1>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-600 text-red-700 p-4 rounded-md shadow mb-6 flex items-center gap-2">
          <XCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
        <StatCard
          label="Total"
          value={summaryCounts.total}
          icon={<Users />}
          color="bg-stone-600"
        />
        <StatCard
          label="Unprinted"
          value={summaryCounts.unprinted}
          icon={<FileDown />}
          color="bg-yellow-500"
        />
        <StatCard
          label="Printed"
          value={summaryCounts.printed}
          icon={<FileCheck />}
          color="bg-blue-500"
        />
        <StatCard
          label="Delivered"
          value={summaryCounts.delivered}
          icon={<CheckCircle2 />}
          color="bg-purple-500"
        />
        <StatCard
          label="Failed"
          value={summaryCounts.failed}
          icon={<FileX2 />}
          color="bg-red-500"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="text-lg font-bold text-stone-700 mb-4">
            Print Status Distribution
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={printStatusData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
              >
                {printStatusData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="text-lg font-bold text-stone-700 mb-4">
            Print Status Overview
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={printStatusData}>
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon, color }) => (
  <div className="bg-white p-4 rounded-xl shadow border border-gray-100 flex items-center space-x-4">
    <div
      className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${color}`}
    >
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

export default OfficerDashboard;
