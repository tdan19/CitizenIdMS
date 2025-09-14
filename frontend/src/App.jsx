import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Admin from "./pages/Admin";
import Officer from "./pages/Officer";
import Supervisor from "./pages/Supervisor";
import Citizen from "./pages/Citizen";
import List from "./components/Dashboards/Admin/User/List";
import Add from "./components/Dashboards/Admin/User/Add";
import EditUser from "./components/Dashboards/Admin/User/EditUser";
import UserProfile from "./components/Dashboards/Admin/User/UserProfile";
import "./App.css";
import PrivateRoutes from "./utils/PrivateRoutes";
import RoleBasedRoutes from "./utils/RoleBasedRoutes";
import RegistrarDataForm from "./components/Dashboards/Registrar/RegistrarDataForm";
import CitizenList from "./components/Dashboards/Registrar/CitizenList";
import EditCitizen from "./components/Dashboards/Registrar/EditCitizen";
import SupervisorDashboard from "./components/Dashboards/Supervisor/SupervisorDashboard";
import OfficerDashboard from "./components/Dashboards/Officer/OfficerDashboard";
import AdminDashboard from "./components/Dashboards/Admin/AdminDashboard";
import CitizenDashboard from "./components/Dashboards/Citizen/CitizenDashboard";
import Settings from "./components/Dashboards/Admin/Settings";
import RegistrarDashboard from "./components/Dashboards/Registrar/RegistrarDashboard";
import FailledId from "./components/Dashboards/Officer/failledId.jsx";
import PrintId from "./components/Dashboards/Officer/printId.jsx";
import Review from "./components/Dashboards/Supervisor/Review.jsx";
import IdRenewal from "./components/Dashboards/Registrar/IdRenewal.jsx";
import Monitor from "./components/Dashboards/Supervisor/Monitor.jsx";
import PrintedId from "./components/Dashboards/Officer/printedId.jsx";
import CitizensList from "./components/Dashboards/Admin/User/CitizensList.jsx";
import RoleSelection from "./pages/Role.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<RoleSelection />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/admin"
        element={
          <PrivateRoutes>
            <RoleBasedRoutes requiredRole={["admin"]}>
              <Admin />
            </RoleBasedRoutes>
          </PrivateRoutes>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="user-management" element={<List />} />
        <Route path="add" element={<Add />} />
        <Route path="list" element={<CitizensList />} />
        <Route path="edit/:id" element={<EditUser />} />
        <Route path="profile/:userId" element={<UserProfile />} />
      </Route>

      {/* Registrar Route */}
      <Route
        path="/registrar"
        element={
          <PrivateRoutes>
            <RoleBasedRoutes requiredRole={["registrar"]}>
              <Register />
            </RoleBasedRoutes>
          </PrivateRoutes>
        }
      >
        <Route index element={<RegistrarDashboard />} />
        <Route path="register" element={<RegistrarDataForm />} />
        <Route path="search" element={<CitizenList />} />
        <Route path="edit/:id" element={<EditCitizen />} />{" "}
        <Route path="renewals" element={<IdRenewal />} />
      </Route>

      {/* Officer Routes */}
      <Route
        path="/officer"
        element={
          <PrivateRoutes>
            <RoleBasedRoutes requiredRole={["officer"]}>
              <Officer />
            </RoleBasedRoutes>
          </PrivateRoutes>
        }
      >
        <Route index element={<OfficerDashboard />} />
        <Route path="print-id" element={<PrintId />} />
        <Route path="track-printing" element={<PrintedId />} />
        <Route path="report-issues" element={<FailledId />} />
      </Route>

      {/* Supervisor Routes */}
      <Route
        path="/supervisor"
        element={
          <PrivateRoutes>
            <RoleBasedRoutes requiredRole={["supervisor"]}>
              <Supervisor />
            </RoleBasedRoutes>
          </PrivateRoutes>
        }
      >
        <Route index element={<SupervisorDashboard />} />
        <Route path="review" element={<Review />} />
        <Route path="monitor" element={<Monitor />} />
      </Route>

      {/* Citizen Routes */}
      <Route path="/citizen" element={<CitizenDashboard />} />
    </Routes>
  );
}

export default App;
