import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  IdCard,
  Search,
  User,
  BadgeCheck,
  Phone,
  MapPin,
  Calendar,
  BadgeInfo,
  ArrowLeft,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const IDStatusChecker = () => {
  const [citizenId, setCitizenId] = useState("");
  const [citizenData, setCitizenData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [photoUrl, setPhotoUrl] = useState(null);

  const handleCheckStatus = async () => {
    if (!citizenId.trim()) {
      setError("Citizen ID cannot be empty.");
      return;
    }

    setLoading(true);
    setError("");
    setPhotoUrl(null);
    try {
      const response = await axios.get(
        `${API_BASE}/api/registration/status/${citizenId.trim()}`
      );
      const data = response?.data?.data;

      if (data) {
        setCitizenData(data);
        if (data.biometrics?.photo) {
          setPhotoUrl(
            data.biometrics.photo.startsWith("/")
              ? `${window.location.origin}${data.biometrics.photo}`
              : data.biometrics.photo
          );
        } else {
          setPhotoUrl(null);
        }
      } else {
        setError("No data found for this ID.");
        setCitizenData(null);
        setPhotoUrl(null);
      }
    } catch (error) {
      console.error(error);
      setError("Failed to fetch status. Please try again.");
      setCitizenData(null);
      setPhotoUrl(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchPhoto = async () => {
      if (citizenData && !photoUrl && citizenData._id) {
        const fetchedPhoto = await fetchBiometrics(citizenData._id);
        setPhotoUrl(fetchedPhoto);
      }
    };
    fetchPhoto();
    // eslint-disable-next-line
  }, [citizenData, photoUrl]);

  useEffect(() => {
    if (citizenData && citizenData.biometrics?.photo) {
      const photoPath = citizenData.biometrics.photo;
      setPhotoUrl(
        photoPath.startsWith("/") ? `${API_BASE}${photoPath}` : photoPath
      );
    } else if (citizenData && citizenData._id) {
      fetchBiometrics(citizenData._id).then((fetchedPhoto) => {
        setPhotoUrl(fetchedPhoto);
      });
    } else {
      setPhotoUrl(null);
    }
    // eslint-disable-next-line
  }, [citizenData]);

  const fetchBiometrics = async (citizenId) => {
    try {
      const res = await axios.get(
        `${API_BASE}/api/registration/${citizenId}/biometrics`
      );
      if (res.data.success && res.data.data && res.data.data.photo) {
        const photoPath = res.data.data.photo;
        return photoPath.startsWith("/")
          ? `${API_BASE}${photoPath}`
          : photoPath;
      }
      return null;
    } catch (error) {
      console.error("Biometric fetch error:", error);
      return null;
    }
  };

  const handleBack = () => {
    setCitizenId("");
    setCitizenData(null);
    setPhotoUrl(null);
    setError("");
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-extrabold mb-6 text-center text-stone-800 flex items-center justify-center gap-2">
        <IdCard className="w-7 h-7 text-stone-500" />
        Check Your National ID Status
      </h1>

      <div className="bg-white rounded-2xl shadow-xl p-6 overflow-x-auto border border-stone-200">
        <label className="block mb-2 text-sm font-semibold text-stone-700 flex items-center gap-2">
          <Search className="w-4 h-4 text-stone-400" />
          Enter Your Citizen ID
        </label>
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <div className="relative flex-1">
            <input
              type="text"
              value={citizenId}
              onChange={(e) => setCitizenId(e.target.value)}
              placeholder="e.g. ET-123456789"
              className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-lg shadow-sm bg-stone-50 text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-500 transition"
            />
            <User className="absolute left-3 top-3 w-5 h-5 text-stone-400" />
          </div>
          <button
            onClick={handleCheckStatus}
            disabled={loading}
            className="px-5 py-2.5 bg-stone-700 hover:bg-stone-900 text-white rounded-lg font-semibold shadow transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <BadgeCheck className="w-5 h-5" />
            {loading ? "Checking..." : "Check Status"}
          </button>
          <button
            onClick={handleBack}
            type="button"
            className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg font-semibold shadow flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Clear
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-600 mb-4 flex items-center gap-2">
            <BadgeInfo className="w-4 h-4" />
            {error}
          </p>
        )}

        {citizenData && (
          <div className="mt-6 border-t pt-6">
            <h2 className="text-lg font-bold mb-4 text-stone-700 flex items-center gap-2">
              <User className="w-5 h-5 text-stone-500" />
              Your Details
            </h2>

            <div className="mb-4 flex justify-center">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt="Biometric"
                  className="w-32 h-40 object-cover border-2 border-stone-300 rounded-xl shadow"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://via.placeholder.com/128x160?text=No+Photo";
                  }}
                />
              ) : (
                <div className="w-32 h-40 flex items-center justify-center bg-stone-100 border-2 border-stone-200 rounded-xl text-stone-400">
                  No Photo
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              {[
                [
                  "Full Name",
                  `${citizenData?.firstName || ""} ${
                    citizenData?.middleName || ""
                  } ${citizenData?.lastName || ""}`.trim(),
                  <User className="w-4 h-4 text-stone-400 inline-block mr-1" />,
                ],
                [
                  "Citizen ID",
                  citizenData?.citizen_id,
                  <IdCard className="w-4 h-4 text-stone-400 inline-block mr-1" />,
                ],
                [
                  "Gender",
                  citizenData?.gender,
                  <BadgeInfo className="w-4 h-4 text-stone-400 inline-block mr-1" />,
                ],
                [
                  "Nationality",
                  citizenData?.nationality,
                  <BadgeInfo className="w-4 h-4 text-stone-400 inline-block mr-1" />,
                ],
                [
                  "Date of Birth",
                  citizenData?.dobGregorian,
                  <Calendar className="w-4 h-4 text-stone-400 inline-block mr-1" />,
                ],
                [
                  "Phone",
                  citizenData?.phone,
                  <Phone className="w-4 h-4 text-stone-400 inline-block mr-1" />,
                ],
                [
                  "Region",
                  citizenData?.region,
                  <MapPin className="w-4 h-4 text-stone-400 inline-block mr-1" />,
                ],
                [
                  "Zone",
                  citizenData?.zone,
                  <MapPin className="w-4 h-4 text-stone-400 inline-block mr-1" />,
                ],
                [
                  "Woreda",
                  citizenData?.woreda,
                  <MapPin className="w-4 h-4 text-stone-400 inline-block mr-1" />,
                ],
                [
                  "Kebele",
                  citizenData?.kebele,
                  <MapPin className="w-4 h-4 text-stone-400 inline-block mr-1" />,
                ],
                [
                  "Status",
                  citizenData?.status?.toUpperCase(),
                  <BadgeCheck className="w-4 h-4 text-blue-500 inline-block mr-1" />,
                ],
                [
                  "Print Status",
                  citizenData?.printStatus?.toUpperCase(),
                  <BadgeCheck className="w-4 h-4 text-green-600 inline-block mr-1" />,
                ],
                [
                  "Issued",
                  citizenData?.given_date,
                  <Calendar className="w-4 h-4 text-stone-400 inline-block mr-1" />,
                ],
                [
                  "Expires",
                  citizenData?.expire_date,
                  <Calendar className="w-4 h-4 text-stone-400 inline-block mr-1" />,
                ],
              ].map(([label, value, icon]) => (
                <div key={label} className="flex items-center gap-2">
                  {icon}
                  <span className="font-medium text-stone-600">{label}:</span>
                  <p
                    className={
                      label === "Status"
                        ? "text-blue-700 font-semibold"
                        : label === "Print Status"
                        ? "text-green-700 font-semibold"
                        : "text-stone-800"
                    }
                  >
                    {value || "N/A"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IDStatusChecker;
