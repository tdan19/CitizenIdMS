import React from "react";
import { Link } from "react-router-dom";

const List = () => {
  return (
    <div>
      <div className="text-center">
        <h3 className="text-2xl font-bold">Manage Users</h3>
      </div>
      <div className="flex  justify-between items-center">
        <input
          type="text"
          placeholder="SearchBy ID"
          className="border px-4 py-0.5"
        />
        <Link
          to="/admin/users/add"
          className="bg-blue-500 text-white px-4 py-1 rounded-lg hover:bg-blue-600"
        >
          Add User
        </Link>
      </div>
    </div>
  );
};

export default List;
