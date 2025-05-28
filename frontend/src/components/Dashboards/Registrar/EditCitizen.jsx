import { useParams, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from "axios";

const EditCitizen = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    citizen_id: "",
    given_date: "",
    expire_date: "",
    nationality: "Ethiopian",
    nationality_am: "ኢትዮጵያዊ",
    dobGregorian: "",
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
    woreda: "Dire Dawa Admin",
    woreda_am: "ድሬ ዳዋ አስተዳደር",
    kebele: "",
    status: "", // Make sure status is included
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/registration/${id}`)
      .then((res) => {
        const data = res.data.data;
        setFormData({
          citizen_id: data.citizen_id,
          given_date: data.given_date,
          expire_date: data.expire_date,
          nationality: data.nationality || "Ethiopian",
          nationality_am: data.nationality_am || "ኢትዮጵያዊ",
          dobGregorian: data.dobGregorian,
          firstName: data.firstName,
          firstName_am: data.firstName_am,
          middleName: data.middleName,
          middleName_am: data.middleName_am,
          lastName: data.lastName,
          lastName_am: data.lastName_am,
          gender: data.gender || "Male",
          gender_am: data.gender_am || "ወንድ",
          phone: data.phone || "",
          region: data.region || "Dire Dawa",
          region_am: data.region_am || "ድሬ ዳዋ",
          zone: data.zone || "Dire Dawa",
          zone_am: data.zone_am || "ድሬ ዳዋ",
          woreda: data.woreda || "Dire Dawa Admin",
          woreda_am: data.woreda_am || "ድሬ ዳዋ አስተዳደር",
          kebele: data.kebele || "",
          status: data.status || "",
        });
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Exclude citizen_id from the update data
    const { citizen_id: _citizen_id, ...updateData } = formData;

    // If the citizen was rejected, set status to "waiting"
    if (formData.status === "rejected") {
      updateData.status = "waiting";
    }

    axios
      .patch(`http://localhost:5000/api/registration/${id}`, updateData)
      .then(() => {
        alert("Citizen updated successfully!");
        navigate("/registrar/search");
      })
      .catch((err) => {
        alert("Error updating citizen!");
        console.error("Error updating citizen:", err);
      });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-green-700 mb-4">
        Edit Citizen Information (የዜጋ መረጃ ማስተካከያ)
      </h2>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {/* Citizen ID */}
        <div>
          <label className="text-sm font-medium">Citizen ID</label>
          <input
            type="text"
            name="citizen_id"
            value={formData.citizen_id}
            className="w-full border rounded px-3 py-2 bg-gray-100"
            readOnly
          />
        </div>

        {/* Given Date */}
        <div>
          <label className="text-sm font-medium">Given Date</label>
          <input
            type="date"
            name="given_date"
            value={formData.given_date}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        {/* Expire Date */}
        <div>
          <label className="text-sm font-medium">Expire Date</label>
          <input
            type="date"
            name="expire_date"
            value={formData.expire_date}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 bg-gray-100"
            readOnly
          />
        </div>

        {/* Nationality */}
        <div>
          <label className="text-sm font-medium">Nationality</label>
          <select
            name="nationality"
            value={formData.nationality}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          >
            <option value="Ethiopian">Ethiopian</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Nationality Amharic */}
        <div>
          <label className="text-sm font-medium">ዜግነት</label>
          <select
            name="nationality_am"
            value={formData.nationality_am}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          >
            <option value="ኢትዮጵያዊ">ኢትዮጵያዊ</option>
            <option value="ሌላ">ሌላ</option>
          </select>
        </div>

        {/* Name fields */}
        <div>
          <label className="text-sm font-medium">First Name</label>
          <input
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium">የመጀመሪያ ስም</label>
          <input
            name="firstName_am"
            value={formData.firstName_am}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium">Middle Name</label>
          <input
            name="middleName"
            value={formData.middleName}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium">የአባት ስም</label>
          <input
            name="middleName_am"
            value={formData.middleName_am}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium">Last Name</label>
          <input
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium">የአያት ስም</label>
          <input
            name="lastName_am"
            value={formData.lastName_am}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        {/* Gender */}
        <div>
          <label className="text-sm font-medium">Gender</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">ፆታ</label>
          <select
            name="gender_am"
            value={formData.gender_am}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          >
            <option value="ወንድ">ወንድ</option>
            <option value="ሴት">ሴት</option>
          </select>
        </div>

        {/* Phone */}
        <div>
          <label className="text-sm font-medium">Phone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Region */}
        <div>
          <label className="text-sm font-medium">Region</label>
          <select
            name="region"
            value={formData.region}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          >
            <option value="Dire Dawa">Dire Dawa</option>
            <option value="Addis Ababa">Addis Ababa</option>
          </select>
        </div>

        {/* Zone */}
        <div>
          <label className="text-sm font-medium">Zone</label>
          <input
            name="zone"
            value={formData.zone}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Woreda */}
        <div>
          <label className="text-sm font-medium">Woreda</label>
          <input
            name="woreda"
            value={formData.woreda}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Kebele */}
        <div>
          <label className="text-sm font-medium">Kebele</label>
          <input
            name="kebele"
            value={formData.kebele}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div className="md:col-span-2 mt-4 flex gap-4">
          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          >
            Update Citizen
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="bg-gray-400 text-white px-6 py-2 rounded hover:bg-gray-500"
          >
            Back
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditCitizen;
