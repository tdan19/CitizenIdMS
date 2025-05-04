import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext.jsx";
const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          username,
          password,
        }
      );
      if (response.data.success) {
        login(response.data.user);
        localStorage.setItem("token", response.data.token);

        switch (response.data.user.role) {
          case "admin":
            navigate("/admin");
            break;
          case "register":
            navigate("/register");
            break;
          case "officer":
            navigate("/officer");
            break;
          case "citizen":
            navigate("/citizen");
            break;
          default:
            navigate("/"); // Default fallback
        }
      }
    } catch (error) {
      if (error.response && error.response.data) {
        setError(error.response.data.error || "Wrong username or password");
      } else {
        setError("Wrong username or password");
      }
    }
    // Close the handleSubmit function properly
  };
  return (
    <div className="max-w-md mx-auto mt-20 p-8 font-sans bg-gray-50 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Login Page</h2>
      {error && <div className="text-red-600">{error}</div>}
      <form onSubmit={handleSubmit} className="flex flex-col">
        <label htmlFor="username" className="mb-2 font-semibold">
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          required
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
          className="mb-4 p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoComplete="username"
        />

        <label htmlFor="password" className="mb-2 font-semibold">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Password"
          required
          onChange={(e) => setPassword(e.target.value)}
          className="mb-6 p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoComplete="current-password"
        />

        <button
          type="submit"
          className="py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded disabled:opacity-50"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
