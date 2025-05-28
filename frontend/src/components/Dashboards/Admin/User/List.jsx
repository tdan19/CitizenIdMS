import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DataTable from "react-data-table-component";
import axios from "axios";
import { Search, UserPlus, Loader2 } from "lucide-react";
const List = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/users", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const usersWithExtras = response.data.users.map((user, index) => ({
          ...user,
          sno: index + 1,
          profileLink: `/admin/profile/${user._id}`,
        }));

        setUsers(usersWithExtras);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) =>
    `${user.firstName} ${user.lastName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 tracking-tight">
            Manage Users
          </h1>
          <p className="text-gray-500 mt-2 text-lg">
            View, edit and manage all users.
          </p>
        </div>

        {/* Top Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
            />
          </div>

          <Link
            to="/admin/add"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition"
          >
            <UserPlus className="w-5 h-5" />
            Add New User
          </Link>
        </div>

        {/* Data Table or Loader */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-gray-500 text-lg flex items-center justify-center gap-2">
              <Loader2 className="animate-spin w-6 h-6 text-blue-500" />
              Loading user data...
            </div>
          ) : (
            <DataTable
              columns={[
                {
                  name: "S/N",
                  selector: (row) => row.sno,
                  cell: (row) => <div className="text-center">{row.sno}</div>,
                },
                {
                  name: "Username",
                  selector: (row) => row.username,
                  cell: (row) => (
                    <div className="text-center font-semibold text-gray-800">
                      {row.username}
                    </div>
                  ),
                },
                {
                  name: "Full Name",
                  selector: (row) => `${row.firstName} ${row.lastName}`,
                  cell: (row) => (
                    <div className="text-center text-gray-700">
                      {row.firstName} {row.lastName}
                    </div>
                  ),
                },
                {
                  name: "Email",
                  selector: (row) => row.email,
                  cell: (row) => (
                    <div className="text-center text-gray-600">{row.email}</div>
                  ),
                },
                {
                  name: "Profile",
                  cell: (row) => (
                    <div className="text-center">
                      <Link
                        to={row.profileLink}
                        className="text-blue-600 hover:text-blue-800 font-medium transition"
                      >
                        View Profile
                      </Link>
                    </div>
                  ),
                },
              ]}
              data={filteredUsers}
              pagination
              highlightOnHover
              responsive
              customStyles={{
                headCells: {
                  style: {
                    backgroundColor: "#f9fafb", // Tailwind gray-50
                    fontWeight: "600",
                    color: "#374151", // Tailwind gray-700
                    fontSize: "14px",
                    padding: "14px 16px",
                  },
                },
                cells: {
                  style: {
                    padding: "14px 16px",
                    color: "#1F2937", // Tailwind gray-800
                    fontSize: "14px",
                  },
                },
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default List;
