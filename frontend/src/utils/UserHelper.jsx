export const userColumns = [
  {
    name: "S no",
    selector: (row) => row.sno,
    sortable: true,
  },
  {
    name: "Username",
    selector: (row) => row.username,
    sortable: true,
  },
  {
    name: "First Name",
    selector: (row) => row.firstName,
    sortable: true,
  },
  {
    name: "Last Name",
    selector: (row) => row.lastName,
    sortable: true,
  },
  {
    name: "Email",
    selector: (row) => row.email,
    sortable: true,
  },
  {
    name: "Phone",
    selector: (row) => row.phone,
    sortable: true,
  },
  {
    name: "Date of Birth",
    selector: (row) => new Date(row.dateOfBirth).toLocaleDateString(),
  },
  {
    name: "Start Date",
    selector: (row) => new Date(row.startDate).toLocaleDateString(),
  },
  {
    name: "Marital Status",
    selector: (row) => row.maritalStatus,
  },
  {
    name: "Role",
    selector: (row) => row.role,
  },
  {
    name: "Employee ID",
    selector: (row) => row.employeeId,
  },
  {
    name: "Action",
    selector: (row) => row.action,
  },
];

import { Link } from "react-router-dom";

export const UserButton = ({ user, onEdit, onDelete }) => {
  return (
    <div className="space-x-2">
      <button
        onClick={() => onEdit(user)}
        className="px-2 py-1 text-sm bg-yellow-400 text-white rounded hover:bg-yellow-500"
      >
        Edit
      </button>
      <button
        onClick={() => onDelete(user)}
        className="px-2 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
      >
        Delete
      </button>
    </div>
  );
};
