import React from "react";
import AdminSidebar from "../AdminSidebar.jsx";
import SummaryCard from "../SummaryCard.jsx";
import {
  FaUsers,
  FaIdCardAlt,
  FaCheckCircle,
  FaClock,
  FaChartLine,
  FaExclamationTriangle,
  FaBuilding,
  FaUserTie,
} from "react-icons/fa";

const AdminDashboard = () => {
  // Sample data with new metrics
  const stats = {
    totalPopulation: 45231,
    totalDepartments: 8,
    totalEmployees: 243,
    idCardsIssued: 38902,
    approvedApplications: 28745,
    pendingApplications: 2134,
    monthlyGrowth: 8.2,
    flaggedCases: 423,
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />

      <div className="flex-1 overflow-auto p-8">
        <h1 className="text-2xl font-bold mb-8">Citizen ID System Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <SummaryCard
            icon={<FaUsers className="text-blue-500 text-2xl" />}
            title="Total Population"
            value={stats.totalPopulation.toLocaleString()}
            trend="up"
            trendValue="2.1%"
          />
          <SummaryCard
            icon={<FaBuilding className="text-indigo-500 text-2xl" />}
            title="Total Departments"
            value={stats.totalDepartments}
          />
          <SummaryCard
            icon={<FaUserTie className="text-amber-500 text-2xl" />}
            title="Government Employees"
            value={stats.totalEmployees}
            trend="up"
            trendValue="4.3%"
          />
          <SummaryCard
            icon={<FaIdCardAlt className="text-green-500 text-2xl" />}
            title="ID Cards Issued"
            value={stats.idCardsIssued.toLocaleString()}
            trend="up"
            trendValue="8.7%"
          />
          <SummaryCard
            icon={<FaCheckCircle className="text-purple-500 text-2xl" />}
            title="Approved Applications"
            value={stats.approvedApplications.toLocaleString()}
            trend="steady"
          />
          <SummaryCard
            icon={<FaClock className="text-yellow-500 text-2xl" />}
            title="Pending Applications"
            value={stats.pendingApplications.toLocaleString()}
            trend="down"
            trendValue="1.2%"
          />
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">System Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SummaryCard
              icon={<FaChartLine className="text-teal-500 text-2xl" />}
              title="Monthly Growth Rate"
              value={`${stats.monthlyGrowth}%`}
              trend="up"
            />
            <SummaryCard
              icon={<FaExclamationTriangle className="text-red-500 text-2xl" />}
              title="Flagged Cases"
              value={stats.flaggedCases.toLocaleString()}
              trend="down"
              trendValue="2.3%"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-3">
            <p className="text-gray-600 border-b pb-2">
              New ID cards batch processed (2,134 records)
            </p>
            <p className="text-gray-600 border-b pb-2">
              Department of Health registry updated
            </p>
            <p className="text-gray-600">
              Security validation rules strengthened
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
