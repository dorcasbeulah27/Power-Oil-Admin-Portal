import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaCalendar,
  FaSpinner,
  FaQrcode,
} from "react-icons/fa";
import { campaignAPI } from "../services/api";
import { toast } from "react-toastify";
import CampaignQRCodeGenerator from "../components/CampaignQRCodeGenerator";

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const navigate = useNavigate();

  // ---------------------------------------------------
  // FETCH CAMPAIGNS
  // ---------------------------------------------------
  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await campaignAPI.getAll();
      if (response.data.success) {
        setCampaigns(response.data.campaigns);
      }
    } catch (error) {
      toast.error("Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------
  // DELETE CAMPAIGN
  // ---------------------------------------------------
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this campaign?"))
      return;

    try {
      await campaignAPI.delete(id);
      toast.success("Campaign deleted successfully");
      fetchCampaigns();
    } catch (error) {
      toast.error("Failed to delete campaign");
    }
  };

  // ---------------------------------------------------
  // STATUS BADGE
  // ---------------------------------------------------
  const getStatusBadge = (status) => {
    const styles = {
      active: "bg-green-100 text-green-800",
      draft: "bg-gray-100 text-gray-800",
      paused: "bg-yellow-100 text-yellow-800",
      completed: "bg-blue-100 text-blue-800",
    };

    return (
      <span
        className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${
          styles[status] || styles["draft"]
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // ---------------------------------------------------
  // LOADING UI
  // ---------------------------------------------------
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-20 h-20 border-4 border-gray-200 border-t-[#1ea25cff] rounded-full animate-spin"></div>
      </div>
    );
  }

  // ---------------------------------------------------
  // RENDER UI
  // ---------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-green-500 to-green-400 bg-clip-text text-transparent mb-2">
              Campaigns
            </h1>
            <p className="text-gray-600">
              Manage customer engagement campaigns
            </p>
          </div>

          <Link
            to="/campaigns/new"
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1ea25cff] to-[#1ea25cff] text-white rounded-xl hover:shadow-xl transition font-semibold"
          >
            <FaPlus /> New Campaign
          </Link>
        </div>

        {/* TABLE */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden border border-white/20">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Campaign
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Spins
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                    QR Code
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {campaigns.map((campaign) => (
                  <tr
                    key={campaign.id}
                    className="hover:bg-gray-50 transition-colors group"
                  >
                    {/* NAME + DESCRIPTION */}
                    <td className="px-6 py-4 whitespace-nowrap w-[500px] max-w-[500px]">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gradient-to-br from-blue-100 to-emerald-100 rounded-lg">
                          <FaCalendar className="text-green-600 text-lg" />
                        </div>
                        <div className="truncate">
                          <div className="text-sm font-bold text-gray-900 group-hover:text-[#1ea25cff] transition-colors truncate">
                            {campaign.name}
                          </div>
                          <div className="text-xs text-gray-500 line-clamp-1 truncate">
                            {campaign.description}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* DATES */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      <div className="font-semibold">
                        {new Date(campaign.startDate).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        to {new Date(campaign.endDate).toLocaleDateString()}
                      </div>
                    </td>

                    {/* STATUS */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(campaign.status)}
                    </td>

                    {/* SPINS */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">
                      {campaign.totalSpins || 0}
                    </td>

                    {/* QR CODE */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => setSelectedCampaign(campaign)}
                        className="p-2 text-[#1ea25cff] hover:bg-gray-50 rounded-lg transition"
                        title="Generate QR Code"
                      >
                        <FaQrcode className="text-lg" />
                      </button>
                    </td>

                    {/* ACTIONS */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() =>
                            navigate(`/campaigns/edit/${campaign.id}`)
                          }
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          <FaEdit className="text-sm" />
                        </button>

                        <button
                          onClick={() => handleDelete(campaign.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <FaTrash className="text-sm" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* EMPTY STATE */}
        {campaigns.length === 0 && (
          <div className="text-center py-20 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaCalendar className="text-5xl text-[#1ea25cff]" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                No campaigns found
              </h3>
              <p className="text-gray-600 mb-6">
                Create a new campaign to get started
              </p>

              <Link
                to="/campaigns/new"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#1ea25cff] to-[#1ea25cff] text-white rounded-xl hover:shadow-xl transition font-semibold text-lg"
              >
                <FaPlus /> Create Campaign
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* QR CODE MODAL */}
      {selectedCampaign && (
        <CampaignQRCodeGenerator
          campaignId={selectedCampaign.id}
          campaignName={selectedCampaign.name}
          onClose={() => setSelectedCampaign(null)}
        />
      )}
    </div>
  );
};

export default Campaigns;
