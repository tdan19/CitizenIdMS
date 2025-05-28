import React, { useEffect, useState } from "react";
import {
  X,
  Image as ImageIcon,
  Printer,
  User,
  Phone,
  BadgeInfo,
} from "lucide-react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ViewProfile = ({ isOpen, onClose, citizen }) => {
  const [photoUrl, setPhotoUrl] = useState(null);

  useEffect(() => {
    const getPhoto = async () => {
      if (!citizen) {
        setPhotoUrl(null);
        return;
      }
      // 1. Try direct biometrics.photo
      if (citizen.biometrics?.photo) {
        setPhotoUrl(
          citizen.biometrics.photo.startsWith("/")
            ? `${API_BASE}${citizen.biometrics.photo}`
            : citizen.biometrics.photo
        );
      } else if (citizen._id) {
        // 2. Fallback: fetch biometrics by ID
        try {
          const res = await axios.get(
            `${API_BASE}/api/registration/${citizen._id}/biometrics`
          );
          if (res.data.success && res.data.data && res.data.data.photo) {
            setPhotoUrl(
              res.data.data.photo.startsWith("/")
                ? `${API_BASE}${res.data.data.photo}`
                : res.data.data.photo
            );
          } else {
            setPhotoUrl(null);
          }
        } catch {
          setPhotoUrl(null);
        }
      } else {
        setPhotoUrl(null);
      }
    };
    getPhoto();
  }, [citizen]);

  if (!isOpen || !citizen) return null;

  const printStatus = citizen.printStatus || "unprinted";

  return (
    <div className="fixed inset-0 bg-stone-800 bg-opacity-60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-stone-200">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-extrabold text-stone-800 flex items-center gap-2">
              <User className="w-7 h-7 text-stone-500" />
              {citizen.firstName} {citizen.lastName}
            </h2>
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-stone-600 transition"
              title="Close"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Personal Info & Photo */}
            <div>
              <div className="mb-4 flex flex-col items-center">
                <div className="mb-2">
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt="Citizen"
                      className="w-32 h-32 rounded-xl object-cover border-2 border-stone-300 shadow"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://via.placeholder.com/128x128?text=No+Photo";
                      }}
                    />
                  ) : (
                    <div className="w-32 h-32 flex items-center justify-center bg-stone-100 rounded-xl border-2 border-stone-200">
                      <ImageIcon className="w-12 h-12 text-stone-300" />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Printer className="w-5 h-5 text-stone-400" />
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full
                    ${
                      printStatus === "printed"
                        ? "bg-green-100 text-green-800"
                        : printStatus === "delivered"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-stone-200 text-stone-700"
                    }
                  `}
                  >
                    Print Status: {printStatus}
                  </span>
                </div>
              </div>
              <div className="mb-4">
                <h3 className="text-lg font-bold mb-2 text-stone-700 flex items-center gap-2">
                  <BadgeInfo className="w-5 h-5 text-stone-400" />
                  Personal Information
                </h3>
                <div className="space-y-2 text-stone-700">
                  <p>
                    <span className="font-semibold">Citizen ID:</span>{" "}
                    <span className="font-mono">{citizen.citizen_id}</span>
                  </p>
                  <p>
                    <span className="font-semibold">Full Name (EN):</span>{" "}
                    {citizen.firstName} {citizen.middleName} {citizen.lastName}
                  </p>
                  <p>
                    <span className="font-semibold">Full Name (AM):</span>{" "}
                    {citizen.firstName_am} {citizen.middleName_am}{" "}
                    {citizen.lastName_am}
                  </p>
                  <p>
                    <span className="font-semibold">Gender:</span>{" "}
                    {citizen.gender} / {citizen.gender_am}
                  </p>
                  <p>
                    <span className="font-semibold">Date of Birth:</span>{" "}
                    {new Date(citizen.dobGregorian).toLocaleDateString()}
                  </p>
                  <p>
                    <span className="font-semibold">Nationality:</span>{" "}
                    {citizen.nationality} / {citizen.nationality_am}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-bold mb-2 text-stone-700 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-stone-400" />
                  Contact Information
                </h3>
                <div className="space-y-2 text-stone-700">
                  <p>
                    <span className="font-semibold">Phone:</span>{" "}
                    {citizen.phone || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Registration & Address */}
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-bold mb-2 text-stone-700 flex items-center gap-2">
                  <BadgeInfo className="w-5 h-5 text-stone-400" />
                  Registration Details
                </h3>
                <div className="space-y-2 text-stone-700">
                  <p>
                    <span className="font-semibold">Given Date:</span>{" "}
                    {new Date(citizen.given_date).toLocaleDateString()}
                  </p>
                  <p>
                    <span className="font-semibold">Expire Date:</span>{" "}
                    {new Date(citizen.expire_date).toLocaleDateString()}
                  </p>
                  <p>
                    <span className="font-semibold">Status:</span>
                    <span
                      className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${
                        citizen.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : citizen.status === "sent"
                          ? "bg-blue-100 text-blue-800"
                          : citizen.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : citizen.status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-stone-200 text-stone-700"
                      }`}
                    >
                      {citizen.status}
                    </span>
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-bold mb-2 text-stone-700 flex items-center gap-2">
                  <BadgeInfo className="w-5 h-5 text-stone-400" />
                  Address
                </h3>
                <div className="space-y-2 text-stone-700">
                  <p>
                    <span className="font-semibold">Region:</span>{" "}
                    {citizen.region} / {citizen.region_am}
                  </p>
                  <p>
                    <span className="font-semibold">Zone:</span> {citizen.zone}{" "}
                    / {citizen.zone_am}
                  </p>
                  <p>
                    <span className="font-semibold">Woreda:</span>{" "}
                    {citizen.woreda} / {citizen.woreda_am}
                  </p>
                  <p>
                    <span className="font-semibold">Kebele:</span>{" "}
                    {citizen.kebele}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewProfile;
