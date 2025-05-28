import { useState } from "react";
import API from "../../../../services/api";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  UserPlus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AddUser({ onSuccess }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    password: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    maritalStatus: "single",
    startDate: "",
    role: "registrar",
    employeeId: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (apiError) setApiError("");
    if (successMessage) setSuccessMessage("");
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.username.trim()) newErrors.username = "Username is required";
    if (!form.password) newErrors.password = "Password is required";
    else if (form.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (!form.firstName.trim()) newErrors.firstName = "First name is required";
    if (!form.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email))
      newErrors.email = "Invalid email format";
    if (!form.phone.trim()) newErrors.phone = "Phone is required";
    if (!form.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required";
    if (!form.startDate) newErrors.startDate = "Start date is required";
    if (!form.employeeId.trim())
      newErrors.employeeId = "Employee ID is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const formData = {
        ...form,
        dateOfBirth: new Date(form.dateOfBirth).toISOString(),
        startDate: new Date(form.startDate).toISOString(),
      };

      const response = await API.post("/users/", formData);

      if (response.data.success) {
        setSuccessMessage("User added successfully!"); // Set success message
        setForm({
          username: "",
          password: "",
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          dateOfBirth: "",
          maritalStatus: "single",
          startDate: "",
          role: "registrar",
          employeeId: "",
        });

        if (onSuccess) onSuccess();
        navigate("/admin/add");
      }
    } catch (err) {
      console.error("Add user error:", err);

      let errorMessage = "Failed to add user";
      if (err.response) {
        if (err.response.status === 404) {
          errorMessage =
            "API endpoint not found. Please check the server configuration.";
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      }

      setApiError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <UserPlus className="w-6 h-6 text-blue-600" />
        Add New User
      </h2>

      {/* API Error */}
      {apiError && (
        <div className="mb-4 p-4 rounded-lg bg-red-50 text-red-700 border border-red-200 flex items-start gap-2">
          <XCircle className="w-5 h-5 mt-0.5" />
          <span>{apiError}</span>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-4 rounded-lg bg-green-50 text-green-700 border border-green-200 flex items-start gap-2">
          <CheckCircle className="w-5 h-5 mt-0.5" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Validation Errors */}
      {Object.keys(errors).length > 0 && (
        <div className="mb-4 p-4 rounded-lg bg-red-50 text-red-700 border border-red-200 space-y-1">
          {Object.values(errors).map((error, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5" />
              <span>{error}</span>
            </div>
          ))}
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Input Fields */}
        {[
          { label: "Username*", name: "username" },
          { label: "Password*", name: "password", type: "password" },
          { label: "First Name*", name: "firstName" },
          { label: "Last Name*", name: "lastName" },
          { label: "Email*", name: "email", type: "email" },
          { label: "Phone*", name: "phone" },
          { label: "Date of Birth*", name: "dateOfBirth", type: "date" },
          { label: "Start Date*", name: "startDate", type: "date" },
          { label: "Employee ID*", name: "employeeId" },
        ].map(({ label, name, type = "text" }) => (
          <div key={name}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {label}
            </label>
            <input
              name={name}
              type={type}
              value={form[name]}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm ${
                errors[name] ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors[name] && (
              <p className="text-xs text-red-600 mt-1">{errors[name]}</p>
            )}
          </div>
        ))}

        {/* Marital Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Marital Status*
          </label>
          <select
            name="maritalStatus"
            value={form.maritalStatus}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="single">Single</option>
            <option value="married">Married</option>
            <option value="divorced">Divorced</option>
            <option value="widowed">Widowed</option>
          </select>
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role*
          </label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="registrar">Registrar</option>
            <option value="supervisor">Supervisor</option>
            <option value="officer">Officer</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="col-span-full flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-100 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-md text-white bg-blue-600 hover:bg-blue-700 transition ${
              isSubmitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin w-4 h-4" />
                Adding...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Add User
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
