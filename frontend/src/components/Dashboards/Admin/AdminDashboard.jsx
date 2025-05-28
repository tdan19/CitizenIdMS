import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { ChartBarIcon, UsersIcon } from "@heroicons/react/24/outline";

const AdminDashboard = () => {
  const [citizens, setCitizens] = useState([]);
  const [error, setError] = useState(null);

  const fetchCitizens = async () => {
    setError(null);
    try {
      const res = await axios.get("http://localhost:5000/api/registration");
      setCitizens(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch citizens", err);
      setError("Failed to load citizens. Please try again.");
    }
  };

  useEffect(() => {
    fetchCitizens();
  }, []);

  const summaryCounts = {
    total: citizens.length,
    waiting: citizens.filter((c) => c.status === "waiting").length,
    pending: citizens.filter((c) => c.status === "pending").length,
    approved: citizens.filter((c) => c.status === "approved").length,
    rejected: citizens.filter((c) => c.status === "rejected").length,
    delivered: citizens.filter((c) => c.printStatus === "delivered").length,
    printed: citizens.filter((c) => c.printStatus === "printed").length,
    failed: citizens.filter((c) => c.printStatus === "failed").length,
    unprinted: citizens.filter(
      (c) => !["printed", "delivered", "failed"].includes(c.printStatus || "")
    ).length,
  };

  const statusChartData = [
    { name: "Waiting", value: summaryCounts.waiting },
    { name: "Pending", value: summaryCounts.pending },
    { name: "Approved", value: summaryCounts.approved },
    { name: "Rejected", value: summaryCounts.rejected },
  ];

  const printStatusChartData = [
    { name: "Unprinted", value: summaryCounts.unprinted },
    { name: "Printed", value: summaryCounts.printed },
    { name: "Failed", value: summaryCounts.failed },
    { name: "Delivered", value: summaryCounts.delivered },
  ];

  const COLORS = [
    "#10B981", // green
    "#FBBF24", // yellow
    "#EF4444", // red
    "#3B82F6", // blue
    "#8B5CF6", // purple
    "#DC2626", // dark red
    "#FB923C", // orange
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center flex justify-center items-center gap-2">
        <UsersIcon className="w-7 h-7 text-blue-600" />
        Admin Dashboard
      </h1>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4 mb-6">
        {Object.entries(summaryCounts).map(([key, value], i) => (
          <StatCard
            key={key}
            label={key.charAt(0).toUpperCase() + key.slice(1)}
            value={value}
            color={COLORS[i % COLORS.length]}
          />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registration Status */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ChartBarIcon className="w-5 h-5 text-blue-500" />
            Registration Status Summary
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statusChartData}>
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Print Status */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ChartBarIcon className="w-5 h-5 text-purple-500" />
            Print Status Distribution
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={printStatusChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={100}
                dataKey="value"
              >
                {printStatusChartData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, color }) => (
  <div
    className="bg-white p-4 rounded-lg shadow border-l-4"
    style={{ borderColor: color }}
  >
    <h3 className="text-sm font-medium text-gray-500">{label}</h3>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

export default AdminDashboard;
