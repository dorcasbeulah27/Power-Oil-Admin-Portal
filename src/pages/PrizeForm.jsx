import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { prizeAPI } from "../services/api";
import {
  FaSave,
  FaTimes,
  FaGift,
  FaPalette,
  FaCog,
} from "react-icons/fa";

const PrizeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "",
    color: "#FFD700",
    isActive: true,
  });

  // Fetch prize if editing
  useEffect(() => {
    if (isEdit) fetchPrize();
  }, [id]);

  // Load prize for edit
  const fetchPrize = async () => {
    try {
      const res = await prizeAPI.getById(id);
      if (res.data.success) {
        const prize = res.data.prize;
        setFormData({
          name: prize.name || "",
          description: prize.description || "",
          type: prize.type || "",
          color: prize.color || "#FFD700",
          isActive: prize.isActive ?? true,
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load prize");
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      if (isEdit) {
        await prizeAPI.update(id, formData);
        toast.success("Prize updated successfully");
      } else {
        await prizeAPI.create(formData);
        toast.success("Prize created successfully");
      }

      navigate("/prizes");
    } catch (err) {
      console.log(err);
      toast.error("Failed to save prize");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-green-500 to-green-400 bg-clip-text text-transparent mb-2">
            {isEdit ? "Edit Prize" : "Add New Prize"}
          </h1>
          <p className="text-gray-600">Create or modify a campaign prize</p>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl">
                <FaGift className="text-white text-xl" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                Basic Information
              </h2>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Prize Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
                    placeholder="e.g., Free Coffee"
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white"
                  >
                    <option value="">Select Type</option>
                    <option value="Product">Product</option>
                    <option value="Discount Voucher">Discount Voucher</option>
                    <option value="Airtime">Airtime</option>
                    <option value="Merchandise">Merchandise</option>
                    <option value="Wellness Pack">Wellness Pack</option>
                    <option value="No Win">No Win</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl resize-none"
                  placeholder="Describe the prize..."
                />
              </div>
            </div>
          </div>

          {/* Appearance */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl">
                <FaPalette className="text-white text-xl" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                Appearance
              </h2>
            </div>

            <div className="space-y-6">
              {/* Color */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Color
                </label>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  className="w-full h-12 border-2 border-gray-200 rounded-xl cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl">
                <FaCog className="text-white text-xl" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                Settings
              </h2>
            </div>

            <div className="flex gap-8">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="w-5 h-5 rounded"
                />
                <span className="text-sm font-semibold text-gray-700">
                  ✓ Active
                </span>
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-[#1ea25cff] to-[#1ea25cff] text-white rounded-xl shadow-xl hover:-translate-y-1 transition-all"
            >
              <FaSave />
              {loading ? "Saving..." : isEdit ? "Update Prize" : "Add Prize"}
            </button>

            <button
              onClick={() => navigate("/prizes")}
              className="px-8 py-4 border-2 border-gray-300 rounded-xl hover:bg-gray-50"
            >
              <FaTimes className="inline mr-2" /> Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrizeForm;
