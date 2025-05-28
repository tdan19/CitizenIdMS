import React, { useEffect, useState } from "react";
import axios from "axios";
import ViewProfile from "../Registrar/ViewProfile";
import QRCode from "qrcode";
import {
  Printer,
  Eye,
  CheckCircle2,
  XCircle,
  Loader2,
  Filter,
  Search,
  Users,
} from "lucide-react";

const PrintId = () => {
  const [citizens, setCitizens] = useState([]);
  const [filteredCitizens, setFilteredCitizens] = useState([]);
  const [filter, setFilter] = useState("all");
  const [selectedCitizen, setSelectedCitizen] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [statusChange, setStatusChange] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const handleStatusChange = async () => {
    if (selectedIds.length === 0 || !statusChange) {
      alert("Please select at least one citizen and choose a status");
      return;
    }

    // Filter out only those citizens whose current printStatus allows this transition
    const validUpdates = selectedIds.filter((id) => {
      const citizen = citizens.find((c) => c._id === id);
      const current = citizen?.printStatus || "unprinted";
      return (
        (statusChange === "printed" && current === "unprinted") ||
        (statusChange === "delivered" && current === "printed") ||
        (statusChange === "failed" && current === "unprinted")
      );
    });

    if (validUpdates.length === 0) {
      alert("No valid status transitions for selected citizens");
      return;
    }

    try {
      const res = await axios.patch(
        `${API_BASE}/api/registration/bulk-print-status`,
        {
          ids: validUpdates,
          newStatus: statusChange,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.data.success) {
        // Option A: re-fetch from server
        await fetchCitizens();

        setCitizens((prev) =>
          prev.map((c) =>
            validUpdates.includes(c._id)
              ? { ...c, printStatus: statusChange }
              : c
          )
        );

        setSelectedIds([]);
        setStatusChange("");
      } else {
        throw new Error(res.data.message || "Bulk update failed");
      }
    } catch (err) {
      console.error("Bulk update error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to update status. Please try again."
      );
    }
  };

  // Calculate summary counts

  const fetchCitizens = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("http://localhost:5000/api/registration", {
        params: { status: "approved" },
      });
      setCitizens(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch citizens", err);
      setError("Failed to load citizens. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Helper to get auth header for axios requests
  const getAuthHeader = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  const fetchBiometrics = async (citizenId) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/registration/${citizenId}/biometrics`,
        getAuthHeader()
      );

      if (res.data.success && res.data.data) {
        return {
          photo: res.data.data.photo
            ? `http://localhost:5000${res.data.data.photo}`
            : null,
          signature: res.data.data.signature
            ? `http://localhost:5000${res.data.data.signature}`
            : null,
        };
      }
      throw new Error(res.data.message || "Biometric data not available");
    } catch (error) {
      console.error("Biometric fetch error:", error);
      return {
        photo: null,
        signature: null,
      };
    }
  };
  useEffect(() => {
    fetchCitizens();
  }, []);

  useEffect(() => {
    const lowerSearch = searchTerm.toLowerCase();
    const filtered = citizens.filter((c) => {
      const matchesFilter =
        filter === "all" || (c.printStatus || "unprinted") === filter;
      const fullName = `${c.firstName} ${c.middleName || ""} ${
        c.lastName
      }`.toLowerCase();
      const matchesSearch = fullName.includes(lowerSearch);
      return matchesFilter && matchesSearch;
    });

    setFilteredCitizens(filtered);
  }, [filter, citizens, searchTerm]);

  const updatePrintStatus = async (id, newStatus) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/registration/${id}/print`,
        { printStatus: newStatus },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      fetchCitizens();
    } catch (err) {
      console.error("Failed to update status", err);
      setError("Failed to update status. Please try again.");
    }
  };

  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleView = (citizen) => {
    setSelectedCitizen(citizen);
    setViewOpen(true);
  };

  const replaceTemplatePlaceholders = (template, citizen, qrData, photoUrl) => {
    return template
      .replace(/{{photo}}/g, photoUrl) // <-- Add this line!
      .replace(/{{fullPhotoUrl}}/g, photoUrl)
      .replace(/{{citizen_id}}/g, citizen.citizen_id || "")
      .replace(/{{firstName}}/g, citizen.firstName || "")
      .replace(/{{middleName}}/g, citizen.middleName || "")
      .replace(/{{lastName}}/g, citizen.lastName || "")
      .replace(/{{firstName_am}}/g, citizen.firstName_am || "")
      .replace(/{{middleName_am}}/g, citizen.middleName_am || "")
      .replace(/{{lastName_am}}/g, citizen.lastName_am || "")
      .replace(/{{dobGregorian}}/g, citizen.dobGregorian || "")
      .replace(/{{nationality}}/g, citizen.nationality || "")
      .replace(/{{nationality_am}}/g, citizen.nationality_am || "")
      .replace(/{{gender}}/g, citizen.gender || "")
      .replace(/{{gender_am}}/g, citizen.gender_am || "")
      .replace(/{{given_date}}/g, citizen.given_date || "")
      .replace(/{{expire_date}}/g, citizen.expire_date || "")
      .replace(/{{phone}}/g, citizen.phone || "")
      .replace(/{{region}}/g, citizen.region || "")
      .replace(/{{region_am}}/g, citizen.region_am || "")
      .replace(/{{zone}}/g, citizen.zone || "")
      .replace(/{{zone_am}}/g, citizen.zone_am || "")
      .replace(/{{woreda}}/g, citizen.woreda || "")
      .replace(/{{woreda_am}}/g, citizen.woreda_am || "")
      .replace(/{{kebele}}/g, citizen.kebele || "")
      .replace(/{{qrData}}/g, encodeURIComponent(qrData));
  };

  const handlePrint = async (citizen) => {
    const printWindow = window.open("", "_blank", "width=800,height=600");
    if (!printWindow) return;

    try {
      // First try to get photo from citizen object
      let photoUrl = citizen.biometrics?.photo
        ? `http://localhost:5000${citizen.biometrics.photo}`
        : null;

      // If not available, try to fetch from API
      if (!photoUrl) {
        const biometrics = await fetchBiometrics(citizen._id);
        photoUrl = biometrics.photo;
      }

      // Verify the photo URL exists
      if (photoUrl) {
        try {
          const response = await fetch(photoUrl, { method: "HEAD" });
          if (!response.ok) {
            console.warn("Photo URL not accessible:", photoUrl);
            photoUrl = null;
          }
        } catch (error) {
          console.warn("Error checking photo URL:", error);
          photoUrl = null;
        }
      }

      // If still no valid photo, use a placeholder
      if (!photoUrl) {
        photoUrl = "https://via.placeholder.com/150?text=No+Photo+Available";
        console.warn("Using placeholder image for citizen:", citizen._id);
      }

      // Rest of your printing logic...
      const qrData = JSON.stringify({
        id: citizen.citizen_id,
        name: `${citizen.firstName} ${citizen.lastName}`,
        phone: citizen.phone,
        region: citizen.region,
        issueDate: citizen.given_date,
        expiryDate: citizen.expire_date,
      });

      const frontTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>ID Card - Front</title>
          <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 0; 
          padding: 0; 
          background-color: #f5f5f5;
        }
        .page-break {
          margin-top: 20mm;
        }
        .passport-front {
          width: 85mm; 
          height: 55mm;
          background: linear-gradient(to bottom, #1a3e8c, #0a2b6d);
          color: white; 
          position: relative;
          border-radius: 5px; 
          overflow: hidden;
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
          margin-bottom: 10mm;
        }
        .header {
          background-color: #0a2b6d; 
          padding: 8px;
          text-align: center; 
          font-weight: bold;
          font-size: 14px;
          border-bottom: 2px solid gold;
        }
        .content { 
          display: flex; 
          padding: 8px;
          gap: 8px;
        }
        .photo-section {
          width: 40%;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .photo {
          width: 25mm; 
          height: 25mm;
          border: 2px solid white;
          background-color: #eee;
          margin-bottom: 5px;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: hidden;
        }
        .photo img { 
          width: 100%; 
          height: 100%; 
          object-fit: cover;
        }
        .photo-data {
          text-align: center;
          font-size: 9px;
          margin-top: 3px;
        }
        .details { 
          width: 60%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .detail-group {
          margin-bottom: 5px;
        }
        .detail-row { 
          display: flex; 
          margin-bottom: 2px; 
          font-size: 10px;
          align-items: center;
        }
        .label { 
          width: 35%; 
          font-weight: bold;
        }
        .value { 
          width: 65%;
        }
        .amharic {
          font-family: 'Nyala', 'Abyssinica SIL', sans-serif;
        }
        .footer {
          position: absolute; 
          bottom: 0; 
          width: 100%;
          background-color: #0a2b6d; 
          padding: 5px;
          text-align: center; 
          font-size: 8px;
          border-top: 1px solid gold;
        }
        .gender-row {
          background-color: rgba(255,255,255,0.1);
          padding: 2px;
          border-radius: 3px;
        }
      </style>
        </head>
        <body>
          <div class="passport-front">
            <div class="header">CITIZENS ID CARD</div>
            <div class="content">
              <div class="photo-section">
                <div class="photo">
                  <img src="{{photo}}" alt="Photo">
                </div>
                <div class="photo-data">
                  <div>ID: {{citizen_id}}</div>
                  <div>Issued: {{given_date}}</div>
                  <div>Expires: {{expire_date}}</div>
                </div>
              </div>
              <div class="details">
                <div class="detail-group">
                  <div class="detail-row">
                    <div class="label">Name:</div>
                    <div class="value">{{firstName}} {{middleName}} {{lastName}}</div>
                  </div>
                  <div class="detail-row amharic">
                    <div class="label">ስም:</div>
                    <div class="value">{{firstName_am}} {{middleName_am}} {{lastName_am}}</div>
                  </div>
                </div>
                
                <div class="detail-group">
                  <div class="detail-row">
                    <div class="label">Date of Birth:</div>
                    <div class="value">{{dobGregorian}}</div>
                  </div>
                  <div class="detail-row">
                    <div class="label">Nationality:</div>
                    <div class="value">{{nationality}}</div>
                  </div>
                  <div class="detail-row amharic">
                    <div class="label">ዜግነት:</div>
                    <div class="value">{{nationality_am}}</div>
                  </div>
                </div>
                
                <div class="detail-group">
                  <div class="detail-row gender-row">
                    <div class="label">Gender:</div>
                    <div class="value">{{gender}}</div>
                  </div>
                  <div class="detail-row amharic gender-row">
                    <div class="label">ፆታ:</div>
                    <div class="value">{{gender_am}}</div>
                  </div>
                </div>
              </div>
            </div>
            <div class="footer">CITIZENS - Official Identification Document</div>
          </div>
        </body>
        </html>
      `;

      const backTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>ID Card - Back</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 0; 
              background-color: #f5f5f5;
            }
            .passport-back {
              width: 85mm; 
              height: 55mm;
              background: linear-gradient(to bottom, #1a3e8c, #0a2b6d);
              color: white; 
              position: relative;
              border-radius: 5px; 
              overflow: hidden;
              box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            }
            .header {
              background-color: #0a2b6d; 
              padding: 8px;
              text-align: center; 
              font-weight: bold;
              font-size: 14px;
              border-bottom: 2px solid gold;
            }
            .content { 
              padding: 8px;
              display: flex;
              gap: 8px;
            }
            .info-section {
              width: 60%;
            }
            .qr-section {
              width: 40%;
              display: flex;
              flex-direction: column;
              align-items: center;
            }
            .qr-code {
              width: 25mm; 
              height: 25mm;
              background-color: white;
              padding: 2px;
              display: flex;
              justify-content: center;
              align-items: center;
              margin-bottom: 3px;
            }
            .qr-code img {
              width: 100%;
              height: 100%;
              object-fit: contain;
            }
            .qr-data {
              text-align: center;
              font-size: 9px;
            }
            .detail-row { 
              display: flex; 
              margin-bottom: 3px; 
              font-size: 10px;
              align-items: center;
            }
            .label { 
              width: 40%; 
              font-weight: bold;
            }
            .value { 
              width: 60%;
            }
            .amharic {
              font-family: 'Nyala', 'Abyssinica SIL', sans-serif;
            }
            .footer {
              position: absolute; 
              bottom: 0; 
              width: 100%;
              background-color: #0a2b6d; 
              padding: 5px;
              text-align: center; 
              font-size: 8px;
              border-top: 1px solid gold;
            }
          </style>
        </head>
        <body>
          <div class="passport-back">
            <div class="header">CONTACT INFORMATION</div>
            <div class="content">
              <div class="info-section">
                <div class="detail-row">
                  <div class="label">Phone:</div>
                  <div class="value">{{phone}}</div>
                </div>
                <div class="detail-row">
                  <div class="label">Region:</div>
                  <div class="value">{{region}}</div>
                </div>
                <div class="detail-row amharic">
                  <div class="label">ክልል:</div>
                  <div class="value">{{region_am}}</div>
                </div>
                <div class="detail-row">
                  <div class="label">Zone:</div>
                  <div class="value">{{zone}}</div>
                </div>
                <div class="detail-row amharic">
                  <div class="label">ዞን:</div>
                  <div class="value">{{zone_am}}</div>
                </div>
                <div class="detail-row">
                  <div class="label">Woreda:</div>
                  <div class="value">{{woreda}}</div>
                </div>
                <div class="detail-row amharic">
                  <div class="label">ወረዳ:</div>
                  <div class="value">{{woreda_am}}</div>
                </div>
                <div class="detail-row">
                  <div class="label">Kebele:</div>
                  <div class="value">{{kebele}}</div>
                </div>
              </div>
              <div class="qr-section">
                <div class="qr-code">
                  <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data={{qrData}}" alt="QR Code">
                </div>
                <div class="qr-data">
                  <div>ID no: {{citizen_id}}</div>
                  <div>{{firstName}} {{middleName}}</div>
                </div>
              </div>
            </div>
            <div class="footer">Citizens - Official Identification Document</div>
          </div>
        </body>
        </html>
      `;
      const filledFrontTemplate = replaceTemplatePlaceholders(
        frontTemplate,
        citizen,
        qrData,
        photoUrl
      );

      const filledBackTemplate = replaceTemplatePlaceholders(
        backTemplate,
        citizen,
        qrData,
        photoUrl
      );

      printWindow.document.write(`
      ${filledFrontTemplate}
      <div class="page-break"></div>
      ${filledBackTemplate}
    `);

      printWindow.document.close();

      setTimeout(() => {
        printWindow.print();
        printWindow.onafterprint = () => printWindow.close();
      }, 1000);

      // If printStatus is "unprinted" or "failed", update to "printed"
      const currentStatus = (citizen.printStatus || "unprinted").toLowerCase();
      if (currentStatus === "unprinted" || currentStatus === "failed") {
        await updatePrintStatus(citizen._id, "printed");
      }
    } catch (error) {
      console.error("Error in handlePrint:", error);
      printWindow.close();
      alert("Error preparing document for printing. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <Printer className="w-8 h-8 text-stone-700" />
        <h1 className="text-3xl font-extrabold text-stone-800 text-center tracking-tight">
          Printing ID Cards
        </h1>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-600 text-red-700 p-4 rounded-md shadow mb-6 flex items-center gap-2">
          <XCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex flex-wrap items-end gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-stone-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-stone-300 rounded-lg bg-white text-stone-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-400 w-64"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-3 text-stone-400 w-5 h-5" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-10 pr-4 py-2 border border-stone-300 rounded-lg bg-white text-stone-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
          >
            <option value="all">All Statuses</option>
            <option value="unprinted">Unprinted</option>
            <option value="printed">Printed</option>
            <option value="delivered">Delivered</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Status Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 mb-6 bg-white p-4 rounded-lg shadow">
          <select
            value={statusChange}
            onChange={(e) => setStatusChange(e.target.value)}
            className="border border-stone-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
          >
            <option value="">Select status change</option>
            <option value="delivered">Mark as Delivered</option>
            <option value="failed">Mark as Failed</option>
          </select>
          <button
            onClick={() => handleStatusChange(statusChange)}
            disabled={!statusChange}
            className="bg-stone-700 text-white px-5 py-2 rounded-md text-sm hover:bg-stone-800 transition disabled:opacity-50"
          >
            Apply
          </button>
        </div>
      )}

      {/* Table or Spinner */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin w-12 h-12 text-stone-500" />
        </div>
      ) : filteredCitizens.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow text-center text-stone-600">
          No citizens found with status:{" "}
          <span className="font-medium">{filter}</span>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-stone-200">
            <thead className="bg-stone-50 text-xs text-stone-500 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">S/N</th>
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    onChange={(e) =>
                      setSelectedIds(
                        e.target.checked
                          ? filteredCitizens.map((c) => c._id)
                          : []
                      )
                    }
                    checked={
                      selectedIds.length === filteredCitizens.length &&
                      filteredCitizens.length > 0
                    }
                  />
                </th>
                <th className="px-6 py-3 text-left">Citizen ID</th>
                <th className="px-6 py-3 text-left">Full Name</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Print Status</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 text-sm">
              {filteredCitizens.map((citizen, index) => (
                <tr key={citizen._id} className="hover:bg-stone-50 transition">
                  <td className="px-4 py-4 text-stone-700">{index + 1}</td>
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(citizen._id)}
                      onChange={() => handleCheckboxChange(citizen._id)}
                    />
                  </td>
                  <td className="px-6 py-4 font-mono text-stone-800">
                    {citizen.citizen_id}
                  </td>
                  <td className="px-6 py-4 text-stone-800 font-semibold">
                    {citizen.firstName} {citizen.middleName}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                      {citizen.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        citizen.printStatus === "printed"
                          ? "bg-blue-100 text-blue-700"
                          : citizen.printStatus === "delivered"
                          ? "bg-purple-100 text-purple-700"
                          : citizen.printStatus === "failed"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {citizen.printStatus || "Unprinted"}
                    </span>
                  </td>
                  <td className="px-6 py-4 space-y-1">
                    <button
                      onClick={() => handleView(citizen)}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-900 text-sm font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    <button
                      onClick={() => handlePrint(citizen)}
                      className={`flex items-center gap-1 text-sm font-medium ${
                        (citizen.printStatus || "unprinted") === "unprinted"
                          ? "text-green-600 hover:text-green-800"
                          : "text-orange-600 hover:text-orange-800"
                      }`}
                    >
                      <Printer className="w-4 h-4" />
                      {(citizen.printStatus || "unprinted") === "unprinted"
                        ? "Print"
                        : "Reprint"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* View Modal */}
      <ViewProfile
        isOpen={viewOpen}
        onClose={() => setViewOpen(false)}
        citizen={selectedCitizen}
      />
    </div>
  );
};

export default PrintId;
