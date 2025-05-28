import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogIn, User, KeyRound, IdCard } from "lucide-react";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        username,
        password,
      });

      if (res.data.success) {
        const { token, user, redirectTo } = res.data;
        login(user, token);
        navigate(redirectTo || "/");
      }
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.message || "Invalid login");
      } else {
        setError("Server error. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <div className="flex items-center gap-3 mb-10">
        <IdCard className="w-12 h-12 text-stone-800 opacity-90" />
        <h1 className="text-4xl font-bold text-stone-900 tracking-tight">
          <span className="font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-stone-700 to-black">
            Citizens ID
          </span>
          <span className="text-stone-800"> Management System</span>
        </h1>
      </div>

      <div className="w-full max-w-md bg-stone-100 p-8 rounded-xl shadow-xl border border-stone-200 animate-fade-in">
        <h2 className="text-2xl font-bold text-center text-stone-900 mb-6 flex items-center justify-center gap-2">
          <LogIn className="w-6 h-6 text-stone-700" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-stone-700 to-black">
            Login Page
          </span>
        </h2>

        {error && (
          <p className="text-red-700 bg-red-100 border border-red-300 p-3 rounded-lg mb-4 text-sm flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-red-500" />
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-stone-800 mb-1 flex items-center gap-1"
            >
              <User className="w-4 h-4 text-stone-500" />
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-stone-300 rounded-lg bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent transition"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-stone-800 mb-1 flex items-center gap-1"
            >
              <KeyRound className="w-4 h-4 text-stone-500" />
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-stone-300 rounded-lg bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent transition"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-stone-700 to-stone-900 hover:from-stone-800 hover:to-black text-white py-3 rounded-lg font-medium transition-all duration-200 shadow-lg flex items-center justify-center gap-2 group"
          >
            <LogIn className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
