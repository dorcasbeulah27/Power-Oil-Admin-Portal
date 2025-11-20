import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { campaignAPI } from "../services/api";
import { FaSave, FaTimes, FaCalendar, FaCog } from "react-icons/fa";

const CampaignForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  const [loading, setLoading] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);

  useEffect(() => {
    if (isEdit) loadCampaign();
    else setLoadingPage(false);
  }, []);

  const loadCampaign = async () => {
    try {
      const res = await campaignAPI.getById(id);
      if (!res.data.success) return;

      const c = res.data.campaign;

      // set fields (only campaign fields)
      setValue("name", c.name);
      setValue("description", c.description);
      setValue("startDate", c.startDate?.split("T")[0]);
      setValue("endDate", c.endDate?.split("T")[0]);
      setValue("status", c.status);
      setValue("spinCooldownDays", c.spinCooldownDays);
    } catch (err) {
      toast.error("Failed to load campaign");
    } finally {
      setLoadingPage(false);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);

    const payload = {
      name: data.name,
      description: data.description,
      startDate: data.startDate,
      endDate: data.endDate,
      status: data.status,
      spinCooldownDays: data.spinCooldownDays,
    };

    try {
      if (isEdit) {
        await campaignAPI.update(id, payload);
        toast.success("Campaign updated successfully");
      } else {
        await campaignAPI.create(payload);
        toast.success("Campaign created successfully");
      }
      navigate("/campaigns");
    } catch (err) {
      toast.error("Failed to save campaign");
    } finally {
      setLoading(false);
    }
  };

  if (loadingPage) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-16 h-16 border-4 border-green-200 border-t-[#1ea25cff] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* HEADER */}
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-green-500 to-green-400 bg-clip-text text-transparent">
            {isEdit ? "Edit Campaign" : "Create Campaign"}
          </h1>
          <p className="text-gray-600">Manage your campaign details</p>
        </div>

        {/* FORM CARD */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/20 space-y-8"
        >
          {/* SECTION HEADER */}
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-[#1ea25cff] to-[#1ea25cff] rounded-xl">
              <FaCog className="text-white text-xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Basic Details</h2>
          </div>

          {/* NAME */}
          <div>
            <label className="block text-sm font-bold mb-2">
              Campaign Name *
            </label>
            <input
              {...register("name", { required: "Name is required" })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
              placeholder="e.g. Spin to Win"
            />
            {errors.name && (
              <p className="text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block text-sm font-bold mb-2">
              Description *
            </label>
            <textarea
              rows={3}
              {...register("description", {
                required: "Description is required",
              })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
            />
            {errors.description && (
              <p className="text-red-500">{errors.description.message}</p>
            )}
          </div>

          {/* DATES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold mb-2">
                Start Date *
              </label>
              <input
                type="date"
                {...register("startDate", {
                  required: "Start date is required",
                })}
                className="w-full px-4 py-3 border-2 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">End Date *</label>
              <input
                type="date"
                {...register("endDate", { required: "End date is required" })}
                className="w-full px-4 py-3 border-2 rounded-xl"
              />
            </div>
          </div>

          {/* STATUS + COOLDOWN */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold mb-2">Status *</label>
              <select
                {...register("status")}
                className="w-full px-4 py-3 border-2 rounded-xl"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">
                Spin Cooldown (Days)
              </label>
              <input
                type="number"
                {...register("spinCooldownDays")}
                required
                className="w-full px-4 py-3 border-2 rounded-xl"
              />
            </div>

          </div>

          {/* ACTION BUTTONS */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-4 bg-gradient-to-r from-[#1ea25cff] to-[#1ea25cff] text-white rounded-xl font-bold text-lg"
            >
              {loading
                ? "Saving..."
                : isEdit
                ? "Update Campaign"
                : "Create Campaign"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/campaigns")}
              className="px-6 py-4 border-2 rounded-xl"
            >
              <FaTimes className="inline mr-2" /> Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CampaignForm;
