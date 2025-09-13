import { useState, useEffect } from "react";
import BiometricCapture from "./BiometricCapture";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  UserPlus,
  CalendarDays,
  ArrowRight,
  ArrowLeft,
  MapPin,
  Phone,
  Send,
  Fingerprint,
  UserCircle2,
  FileSignature,
  ShieldCheck,
  ArrowBigLeft,
  ArrowBigRight,
} from "lucide-react";

const RegistrarDataForm = ({ userRole = "registrar" }) => {
  const navigate = useNavigate();
  const generateCitizenId = () => {
    const min = 10000000;
    const max = 99999999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const initialFormData = {
    citizen_id: generateCitizenId().toString(),
    nationality: "Ethiopian",
    nationality_am: "ኢትዮጵያዊ",
    dobGregorian: "",
    given_date: "",
    expire_date: "",
    firstName: "",
    firstName_am: "",
    middleName: "",
    middleName_am: "",
    lastName: "",
    lastName_am: "",
    gender: "Male",
    gender_am: "ወንድ",
    phone: "",
    region: "Dire Dawa",
    region_am: "ድሬ ዳዋ",
    zone: "Dire Dawa",
    zone_am: "ድሬ ዳዋ",
    woreda: "Dire Dawa ",
    woreda_am: "ድሬ ዳዋ አስተዳደር",
    kebele: "",
    biometrics: null,
    status: "waiting",
    status_history: [
      {
        status: "waiting",
        changed_by: "registrar",
        timestamp: new Date().toISOString(),
      },
    ],
  };

  const [formData, setFormData] = useState(initialFormData);
  const [currentStep, setCurrentStep] = useState(1);
  const [formComplete, setFormComplete] = useState(false);
  const [usedIds, setUsedIds] = useState(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [citizens, setCitizens] = useState([]);
  const [searchId, setSearchId] = useState("");
  const [errors, setErrors] = useState({});
  const [dateError, setDateError] = useState("");
 
  // Amharic Unicode range validation
  const isAmharic = (text) => {
    const amharicRegex = /^[\u1200-\u137F\s]+$/;
    return amharicRegex.test(text);
  };

  // Ethiopian phone number validation
  const validateEthiopianPhone = (phone) => {
    const phoneRegex = /^\+2519\d{8}$/;
    return phoneRegex.test(phone);
  };

  // Date validation - check if age is at least 21
  const validateDateOfBirth = (dateString) => {
    const today = new Date();
    const birthDate = new Date(dateString);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    return age;
  };

  // Validate given date is not in the future
  const validateGivenDate = (dateString) => {
    const today = new Date();
    const givenDate = new Date(dateString);
    return givenDate <= today;
  };

  // Handle input changes with validation
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Validate Amharic fields
    if (name.endsWith('_am')) {
      if (value && !isAmharic(value)) {
        setErrors({...errors, [name]: "Please enter Amharic characters only"});
      } else {
        const newErrors = {...errors};
        delete newErrors[name];
        setErrors(newErrors);
      }
    }
    
    // Validate phone number
    if (name === 'phone') {
      if (value && !validateEthiopianPhone(value)) {
        setErrors({...errors, [name]: "Phone must be in format: +2519xxxxxxxx"});
      } else {
        const newErrors = {...errors};
        delete newErrors[name];
        setErrors(newErrors);
      }
    }
    
    // Validate date fields
    if (name === 'dobGregorian') {
      if (value) {
        const age = validateDateOfBirth(value);
        if (age < 21) {
          setDateError("Applicant must be at least 21 years old");
        } else {
          setDateError("");
        }
      }
    }
    
    if (name === 'given_date') {
      if (value && !validateGivenDate(value)) {
        setDateError("Given date cannot be in the future");
      } else {
        setDateError("");
      }
    }
    
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Calculate expiration date when given_date changes
  useEffect(() => {
    if (formData.given_date) {
      const givenDate = new Date(formData.given_date);
      const expireDate = new Date(givenDate);
      expireDate.setFullYear(expireDate.getFullYear() + 5);

      const formattedExpireDate = expireDate.toISOString().split("T")[0];

      setFormData((prev) => ({
        ...prev,
        expire_date: formattedExpireDate,
      }));
    }
  }, [formData.given_date]);

  // Fetch all citizens for admin view
  useEffect(() => {
    if (userRole === "admin") {
      const fetchCitizens = async () => {
        try {
          const response = await axios.get(
            "http://localhost:5000/api/citizens"
          );
          setCitizens(response.data);
        } catch (error) {
          console.error("Error fetching citizens:", error);
        }
      };
      fetchCitizens();
    }
  }, [userRole]);

  const handleBiometricsComplete = (biometricData) => {
    setFormData({
      ...formData,
      biometrics: biometricData,
    });
    setFormComplete(true);
  };

  const resetForm = () => {
    let newId;
    do {
      newId = generateCitizenId().toString();
    } while (usedIds.has(newId));

    setUsedIds((prev) => new Set(prev).add(newId));
    setFormData({
      ...initialFormData,
      citizen_id: newId,
      status: "pending",
      status_history: [
        {
          status: "pending",
          changed_by: "registrar",
          timestamp: new Date().toISOString(),
        },
      ],
    });
    setCurrentStep(1);
    setFormComplete(false);
    setErrors({});
    setDateError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Final validation before submission
    if (!formComplete) {
      alert("Please complete all form steps including biometrics");
      setIsSubmitting(false);
      return;
    }

    // Check for validation errors
    if (Object.keys(errors).length > 0) {
      alert("Please fix validation errors before submitting");
      setIsSubmitting(false);
      return;
    }

    // Check date validation
    if (dateError) {
      alert(dateError);
      setIsSubmitting(false);
      return;
    }

    // Validate phone number one more time before submission
    if (formData.phone && !validateEthiopianPhone(formData.phone)) {
      alert("Please enter a valid Ethiopian phone number in the format: +2519xxxxxxxx");
      setIsSubmitting(false);
      return;
    }

    try {
      const submissionData = new FormData();

      // Fill out form data as before
      for (const key in formData) {
        if (key !== "biometrics" && key !== "status_history") {
          submissionData.append(key, formData[key]);
        }
      }

      // Update status to waiting and add status history for submission
      submissionData.append(
        "status_history",
        JSON.stringify([
          ...formData.status_history,
          {
            status: "waiting",
            changed_by: "registrar",
            timestamp: new Date().toISOString(),
          },
        ])
      );

      if (formData.biometrics) {
        submissionData.append("photo", formData.biometrics.photo, "photo.jpg");
        submissionData.append(
          "fingerprint",
          formData.biometrics.fingerprint,
          "fingerprint.jpg"
        );
        submissionData.append(
          "signature",
          formData.biometrics.signature,
          "signature.png"
        );
      }

      const response = await axios.post(
        "http://localhost:5000/api/registration",
        submissionData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status >= 200 && response.status < 300) {
        alert(
          "Registration submitted successfully!"
        );
        resetForm();
        navigate("/registrar")

      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("Error submitting form.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // For supervisor to approve/reject
  const handleStatusChange = async (citizenId, newStatus) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/citizens/${citizenId}/status`,
        {
          status: newStatus,
          changed_by: userRole,
          timestamp: new Date().toISOString(),
        }
      );
      setCitizens(
        citizens.map((c) => (c.citizen_id === citizenId ? response.data : c))
      );
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };

  // For officer to mark as printed
  const handlePrintStatus = async (citizenId) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/citizens/${citizenId}/status`,
        {
          status: "printed",
          changed_by: userRole,
          timestamp: new Date().toISOString(),
        }
      );
      setCitizens(
        citizens.map((c) => (c.citizen_id === citizenId ? response.data : c))
      );
    } catch (error) {
      console.error("Error updating print status:", error);
      alert("Failed to update print status");
    }
  };

  // For citizen to check their status
  const handleStatusCheck = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/citizens/${searchId}`
      );
      if (response.data) {
        alert(`Your status is: ${response.data.status}`);
      } else {
        alert("No record found with that ID");
      }
    } catch (error) {
      console.error("Error checking status:", error);
      alert("Failed to check status");
    }
  };

  const nextStep = () => {
    if (currentStep === 1) {
      // Check required fields
      if (
        !formData.firstName ||
        !formData.middleName ||
        !formData.lastName ||
        !formData.dobGregorian ||
        !formData.given_date
      ) {
        alert("Please fill in all required personal information fields");
        return;
      }
      
      // Check validation errors
      if (Object.keys(errors).length > 0) {
        alert("Please fix validation errors before proceeding");
        return;
      }
      
      // Check date validation
      if (dateError) {
        alert(dateError);
        return;
      }

      // Validate phone number if provided
      if (formData.phone && !validateEthiopianPhone(formData.phone)) {
        alert("Please enter a valid Ethiopian phone number in the format: +2519xxxxxxxx");
        return;
      }
    }
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  // Admin dashboard view
  if (userRole === "admin") {
    return (
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white p-6 rounded shadow-md">
            <h1 className="text-2xl font-bold text-green-700 mb-6">
              Admin Dashboard - All Citizen Statuses
            </h1>

            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b">Citizen ID</th>
                    <th className="py-2 px-4 border-b">Name</th>
                    <th className="py-2 px-4 border-b">Status</th>
                    <th className="py-2 px-4 border-b">Last Updated</th>
                    <th className="py-2 px-4 border-b">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {citizens.map((citizen) => (
                    <tr key={citizen.citizen_id}>
                      <td className="py-2 px-4 border-b">
                        {citizen.citizen_id}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {citizen.firstName} {citizen.lastName}
                      </td>
                      <td className="py-2 px-4 border-b">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            citizen.status === "approved"
                              ? "bg-green-200 text-green-800"
                              : citizen.status === "rejected"
                              ? "bg-red-200 text-red-800"
                              : citizen.status === "printed"
                              ? "bg-blue-200 text-blue-800"
                              : citizen.status === "waiting"
                              ? "bg-yellow-200 text-yellow-800"
                              : "bg-gray-200 text-gray-800"
                          }`}
                        >
                          {citizen.status}
                        </span>
                      </td>

                      <td className="py-2 px-4 border-b">
                        {new Date(
                          citizen.status_history[
                            citizen.status_history.length - 1
                          ].timestamp
                        ).toLocaleString()}
                      </td>
                      <td className="py-2 px-4 border-b">
                        <button
                          className="text-blue-600 hover:text-blue-800 mr-2"
                          onClick={() =>
                            alert(JSON.stringify(citizen, null, 2))
                          }
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Supervisor approval view
  if (userRole === "supervisor") {
    const pendingCitizens = citizens.filter((c) => c.status === "pending");

    return (
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white p-6 rounded shadow-md">
            <h1 className="text-2xl font-bold text-green-700 mb-6">
              Supervisor Approval Dashboard
            </h1>

            {pendingCitizens.length === 0 ? (
              <p className="text-gray-600">No pending applications to review</p>
            ) : (
              <div className="space-y-4">
                {pendingCitizens.map((citizen) => (
                  <div
                    key={citizen.citizen_id}
                    className="border p-4 rounded-lg"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">
                          {citizen.firstName} {citizen.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          ID: {citizen.citizen_id}
                        </p>
                      </div>
                      <div className="space-x-2">
                        <button
                          onClick={() =>
                            handleStatusChange(citizen.citizen_id, "approved")
                          }
                          className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() =>
                            handleStatusChange(citizen.citizen_id, "rejected")
                          }
                          className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Officer printing view
  if (userRole === "officer") {
    const approvedCitizens = citizens.filter((c) => c.status === "approved");

    return (
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white p-6 rounded shadow-md">
            <h1 className="text-2xl font-bold text-green-700 mb-6">
              Officer Printing Dashboard
            </h1>

            {approvedCitizens.length === 0 ? (
              <p className="text-gray-600">No approved applications to print</p>
            ) : (
              <div className="space-y-4">
                {approvedCitizens.map((citizen) => (
                  <div
                    key={citizen.citizen_id}
                    className="border p-4 rounded-lg"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">
                          {citizen.firstName} {citizen.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          ID: {citizen.citizen_id}
                        </p>
                      </div>
                      <button
                        onClick={() => handlePrintStatus(citizen.citizen_id)}
                        className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
                      >
                        Mark as Printed
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Citizen status check view
  if (userRole === "citizen") {
    return (
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white p-6 rounded shadow-md">
            <h1 className="text-2xl font-bold text-green-700 mb-6">
              Check Your Application Status
            </h1>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enter Your Citizen ID
                </label>
                <input
                  type="text"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Your 8-digit citizen ID"
                />
              </div>

              <button
                onClick={handleStatusCheck}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Check Status
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Registrar form view (default)
  return (
    <div className="bg-stone-100 min-h-screen py-10">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-stone-200">
          <div className="flex items-center gap-3 mb-6">
            <UserPlus className="w-8 h-8 text-stone-700" />
            <h1 className="text-3xl font-extrabold text-stone-800 tracking-tight">
              Citizen Registration Form
              <span className="block text-base font-medium text-stone-500">
                የዜጎች ምዝገባ ፎርም
              </span>
            </h1>
          </div>

          {/* Progress Bar */}
          <div className="mb-10">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <UserCircle2
                  className={`w-6 h-6 ${
                    currentStep >= 1 ? "text-green-600" : "text-stone-400"
                  }`}
                />
                <span
                  className={`font-semibold ${
                    currentStep >= 1 ? "text-green-700" : "text-stone-400"
                  }`}
                >
                  Personal Info
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Fingerprint
                  className={`w-6 h-6 ${
                    currentStep >= 2 ? "text-green-600" : "text-stone-400"
                  }`}
                />
                <span
                  className={`font-semibold ${
                    currentStep >= 2 ? "text-green-700" : "text-stone-400"
                  }`}
                >
                  Biometrics
                </span>
              </div>
            </div>
            <div className="w-full bg-stone-200 rounded-full h-3">
              <div
                className="bg-green-600 h-3 rounded-full transition-all duration-300"
                style={{ width: currentStep === 1 ? "50%" : "100%" }}
              ></div>
            </div>
          </div>

          {/* Step 1: Personal Info */}
          {currentStep === 1 && (
            <>
              <h2 className="text-xl font-bold text-stone-700 mb-6 flex items-center gap-2">
                <UserCircle2 className="w-6 h-6 text-stone-500" />
                Demographic Data{" "}
                <span className="text-stone-400">| የሕዝብ ቆጠራ መረጃ</span>
              </h2>
              {dateError && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                  {dateError}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    Citizen ID / መለያ ቁጥር
                  </label>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-stone-400" />
                    <input
                      type="text"
                      name="citizen_id"
                      value={formData.citizen_id}
                      className="w-full border border-stone-300 rounded-lg px-3 py-2 bg-stone-100 text-stone-700 font-mono"
                      readOnly
                    />
                  </div>
                  <p className="text-xs text-stone-400 mt-1">
                    This ID is unique to each citizen and will be verified.
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    Given Date / የተሰጠበት ቀን
                  </label>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-stone-400" />
                    <input
                      type="date"
                      name="given_date"
                      value={formData.given_date}
                      onChange={handleChange}
                      className="w-full border border-stone-300 rounded-lg px-3 py-2 text-stone-700"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    Expire Date / የሚያልቅበት ቀን
                  </label>
                  <input
                    type="date"
                    name="expire_date"
                    value={formData.expire_date}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 bg-stone-100 text-stone-700"
                    readOnly
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">
                      Nationality
                    </label>
                    <select
                      name="nationality"
                      value={formData.nationality}
                      onChange={handleChange}
                      className="w-full border border-stone-300 rounded-lg px-3 py-2 text-stone-700"
                    >
                      <option value="Ethiopian">Ethiopian</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">
                      ዜግነት
                    </label>
                    <select
                      name="nationality_am"
                      value={formData.nationality_am}
                      onChange={handleChange}
                      className="w-full border border-stone-300 rounded-lg px-3 py-2 text-stone-700"
                    >
                      <option value="ኢትዮጵያዊ">ኢትዮጵያዊ</option>
                      <option value="ሌላ">ሌላ</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    Date of Birth / የትውልድ ቀን
                  </label>
                  <input
                    type="date"
                    name="dobGregorian"
                    value={formData.dobGregorian}
                    onChange={handleChange}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-stone-700"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full border border-stone-300 rounded-lg px-3 py-2 text-stone-700"
                      placeholder="First Name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">
                      የመጀመሪያ ስም
                    </label>
                    <input
                      type="text"
                      name="firstName_am"
                      value={formData.firstName_am}
                      onChange={handleChange}
                      className={`w-full border rounded-lg px-3 py-2 text-stone-700 ${
                        errors.firstName_am ? "border-red-500" : "border-stone-300"
                      }`}
                      placeholder="የመጀመሪያ ስም"
                      required
                    />
                    {errors.firstName_am && (
                      <p className="text-red-500 text-xs mt-1">{errors.firstName_am}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">
                      Middle Name
                    </label>
                    <input
                      type="text"
                      name="middleName"
                      value={formData.middleName}
                      onChange={handleChange}
                      className="w-full border border-stone-300 rounded-lg px-3 py-2 text-stone-700"
                      placeholder="Middle Name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">
                      የአባት ስም
                    </label>
                    <input
                      type="text"
                      name="middleName_am"
                      value={formData.middleName_am}
                      onChange={handleChange}
                      className={`w-full border rounded-lg px-3 py-2 text-stone-700 ${
                        errors.middleName_am ? "border-red-500" : "border-stone-300"
                      }`}
                      placeholder="የአባት ስም"
                      required
                    />
                    {errors.middleName_am && (
                      <p className="text-red-500 text-xs mt-1">{errors.middleName_am}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full border border-stone-300 rounded-lg px-3 py-2 text-stone-700"
                      placeholder="Last Name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">
                      የአያት ስም
                    </label>
                    <input
                      type="text"
                      name="lastName_am"
                      value={formData.lastName_am}
                      onChange={handleChange}
                      className={`w-full border rounded-lg px-3 py-2 text-stone-700 ${
                        errors.lastName_am ? "border-red-500" : "border-stone-300"
                      }`}
                      placeholder="የአያት ስም"
                      required
                    />
                    {errors.lastName_am && (
                      <p className="text-red-500 text-xs mt-1">{errors.lastName_am}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full border border-stone-300 rounded-lg px-3 py-2 text-stone-700"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">
                      ጾታ
                    </label>
                    <select
                      name="gender_am"
                      value={formData.gender_am}
                      onChange={handleChange}
                      className="w-full border border-stone-300 rounded-lg px-3 py-2 text-stone-700"
                    >
                      <option value="ወንድ">ወንድ</option>
                      <option value="ሴት">ሴት</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    <Phone className="inline w-4 h-4 mr-1 text-stone-400" />
                    Phone Number / ስልክ ቁጥር
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full border rounded-lg px-3 py-2 text-stone-700 ${
                      errors.phone ? "border-red-500" : "border-stone-300"
                    }`}
                    placeholder="+2519xxxxxxxx"
                    required
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                  )}
                  <p className="text-xs text-stone-400 mt-1">
                    Format: +2519xxxxxxxx (e.g., +251947169355)
                  </p>
                </div>
              </div>

              <h2 className="text-xl font-bold text-stone-700 mb-4 mt-8 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-stone-500" />
                Location <span className="text-stone-400">| አድራሻ</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">
                      Region
                    </label>
                    <select
                      name="region"
                      value={formData.region}
                      onChange={handleChange}
                      className="w-full border border-stone-300 rounded-lg px-3 py-2 text-stone-700"
                    >
                      <option value="Dire Dawa">Dire Dawa</option>
                      <option value="Addis Ababa">Addis Ababa</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">
                      ክልል
                    </label>
                    <select
                      name="region_am"
                      value={formData.region_am}
                      onChange={handleChange}
                      className="w-full border border-stone-300 rounded-lg px-3 py-2 text-stone-700"
                    >
                      <option value="ድሬ ዳዋ">ድሬ ዳዋ</option>
                      <option value="አዲስ አበባ">አዲስ አበባ</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">
                      Zone
                    </label>
                    <select
                      name="zone"
                      value={formData.zone}
                      onChange={handleChange}
                      className="w-full border border-stone-300 rounded-lg px-3 py-2 text-stone-700"
                    >
                      <option value="Dire Dawa">Dire Dawa</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">
                      ዞን
                    </label>
                    <select
                      name="zone_am"
                      value={formData.zone_am}
                      onChange={handleChange}
                      className="w-full border border-stone-300 rounded-lg px-3 py-2 text-stone-700"
                    >
                      <option value="ድሬ ዳዋ">ድሬ ዳዋ</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">
                      Woreda
                    </label>
                    <select
                      name="woreda"
                      value={formData.woreda}
                      onChange={handleChange}
                      className="w-full border border-stone-300 rounded-lg px-3 py-2 text-stone-700"
                    >
                      <option value="Dire Dawa Admin">Dire Dawa </option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">
                      ወረዳ
                    </label>
                    <select
                      name="woreda_am"
                      value={formData.woreda_am}
                      onChange={handleChange}
                      className="w-full border border-stone-300 rounded-lg px-3 py-2 text-stone-700"
                    >
                      <option value="ድሬ ዳዋ አስተዳደር">ድሬ ዳዋ አስተዳደር</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">
                      Kebele/ቀበሌ
                    </label>
                    <select
                      name="kebele"
                      value={formData.kebele}
                      onChange={handleChange}
                      className="w-full border border-stone-300 rounded-lg px-3 py-2 text-stone-700"
                    >
                      <option value=""> </option>
                      {Array.from({ length: 25 }, (_, i) => {
                        const kebeleNumber = String(i + 1).padStart(2, "0");
                        return (
                          <option key={kebeleNumber} value={kebeleNumber}>
                            {kebeleNumber}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center gap-2 bg-green-600 text-white px-8 py-2 rounded-lg font-semibold shadow hover:bg-green-700 disabled:bg-green-300 transition"
                  disabled={
                    !formData.firstName ||
                    !formData.middleName ||
                    !formData.lastName ||
                    !formData.dobGregorian ||
                    !formData.given_date ||
                    Object.keys(errors).length > 0 ||
                    dateError
                  }
                >
                  Next <ArrowBigRight className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2 bg-stone-400 text-white px-8 py-2 rounded-lg font-semibold hover:bg-stone-500 transition"
                >
                  <ArrowBigLeft className="w-5 h-5" />
                  Back
                </button>
              </div>
            </>
          )}

          {/* Step 2: Biometrics */}
          {currentStep === 2 && (
            <>
              <h2 className="text-xl font-bold text-stone-700 mb-6 flex items-center gap-2">
                <Fingerprint className="w-6 h-6 text-stone-500" />
                Biometrics
              </h2>
              <div className="mb-8">
                <BiometricCapture onComplete={handleBiometricsComplete} />
              </div>
              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex items-center gap-2 bg-stone-500 text-white px-8 py-2 rounded-lg font-semibold hover:bg-stone-600 transition"
                >
                  <ArrowBigLeft className="w-5 h-5" />
                  Previous
                </button>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="flex items-center gap-2 bg-blue-700 text-white px-8 py-2 rounded-lg font-semibold shadow hover:bg-blue-800 disabled:bg-blue-300 transition"
                  disabled={!formComplete || isSubmitting || Object.keys(errors).length > 0 || dateError}
                >
                  <Send className="w-5 h-5" />
                  {isSubmitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegistrarDataForm;