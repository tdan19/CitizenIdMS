import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Users,
  XCircle,
  Loader2,
  CheckCircle2,
  Ban,
  Clock,
  User,
  UserCheck,
  UserX,
} from "lucide-react";
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

const COLORS = ["#FBBF24", "#6366F1", "#10B981", "#EF4444"]; // Yellow, Indigo, Green, Red

const RegistrarDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    male: 0,
    female: 0,
    waiting: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

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
      const citizens = response.data.data;

      setStats({
        total: citizens.length,
        male: citizens.filter((c) => c.gender === "Male").length,
        female: citizens.filter((c) => c.gender === "Female").length,
        waiting: citizens.filter((c) => c.status === "waiting").length,
        pending: citizens.filter((c) => c.status === "pending").length,
        approved: citizens.filter((c) => c.status === "approved").length,
        rejected: citizens.filter((c) => c.status === "rejected").length,
      });
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        setError(err.message || "Failed to load citizens.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCitizens();
  }, []);

  const statusData = [
    { name: "Waiting", value: stats.waiting },
    { name: "Pending", value: stats.pending },
    { name: "Approved", value: stats.approved },
    { name: "Rejected", value: stats.rejected },
  ];

  const genderData = [
    { name: "Male", value: stats.male },
    { name: "Female", value: stats.female },
  ];

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
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center gap-4">
          <XCircle className="w-6 h-6 text-red-500" />
          {error}
          <button
            onClick={fetchCitizens}
            className="ml-auto bg-red-500 text-white px-3 py-1 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-stone-100 min-h-screen">
      <div className="flex items-center gap-3 mb-8">
        <Users className="w-8 h-8 text-stone-700" />
        <h1 className="text-3xl font-extrabold text-stone-800 tracking-tight">
          Registrar Dashboard
        </h1>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
        <StatCard
          icon={<Users />}
          label="Total"
          value={stats.total}
          color="bg-blue-600"
        />
        <StatCard
          icon={<User />}
          label="Male"
          value={stats.male}
          color="bg-cyan-600"
        />
        <StatCard
          icon={<User />}
          label="Female"
          value={stats.female}
          color="bg-pink-500"
        />
        <StatCard
          icon={<Clock />}
          label="Waiting"
          value={stats.waiting}
          color="bg-yellow-500"
        />
        <StatCard
          icon={<Clock />}
          label="Pending"
          value={stats.pending}
          color="bg-indigo-500"
        />
        <StatCard
          icon={<UserCheck />}
          label="Approved"
          value={stats.approved}
          color="bg-green-500"
        />
        <StatCard
          icon={<UserX />}
          label="Rejected"
          value={stats.rejected}
          color="bg-red-500"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="text-lg font-bold text-stone-700 mb-4">
            Registration Status Overview
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statusData}>
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="text-lg font-bold text-stone-700 mb-4">
            Gender Distribution
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={genderData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
              >
                {genderData.map((entry, index) => (
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

// Reusable Stat Card
const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-white rounded-xl shadow p-4 flex items-center space-x-4 border border-gray-100">
    <div
      className={`w-10 h-10 flex items-center justify-center text-white rounded-full ${color}`}
    >
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

export default RegistrarDashboard;
