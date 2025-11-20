import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaGift,
  FaBullhorn,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { campaignAPI, prizeAPI, prizeRuleAPI } from "../services/api";
import { toast } from "react-toastify";

const PrizeRules = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [prizes, setPrizes] = useState([]);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const [selectedPrizeId, setSelectedPrizeId] = useState("");
  const [formData, setFormData] = useState({
    probability: "",
    maxPerDay: "",
    maxTotal: "",
    value: "",
  });
  const [editingRule, setEditingRule] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ---------------------------------------------------
  // FETCH DATA
  // ---------------------------------------------------
  useEffect(() => {
    fetchCampaigns();
    fetchPrizes();
    fetchRules();
  }, []);

  useEffect(() => {
    fetchCampaigns();
    fetchPrizes();
  }, []);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filter changes
    fetchRules();
  }, [selectedCampaignId]);

  useEffect(() => {
    fetchRules();
  }, [currentPage]);

  const fetchCampaigns = async () => {
    try {
      const response = await campaignAPI.getAll();
      if (response.data.success) {
        setCampaigns(response.data.campaigns || []);
      }
    } catch (error) {
      toast.error("Failed to load campaigns");
    }
  };

  const fetchPrizes = async () => {
    try {
      const response = await prizeAPI.getAll();
      if (response.data.success) {
        const prizesData = Array.isArray(response.data.prizes)
          ? response.data.prizes
          : Object.keys(response.data.prizes).length > 0
          ? Object.values(response.data.prizes)
          : [];
        setPrizes(prizesData);
      }
    } catch (error) {
      toast.error("Failed to load prizes");
    } finally {
      setLoading(false);
    }
  };

  const fetchRules = async () => {
    try {
      const params = {
        page: currentPage,
        limit,
      };
      if (selectedCampaignId) params.campaignId = selectedCampaignId;

      const response = await prizeRuleAPI.getAll(params);
      if (response.data.success) {
        setRules(response.data.rules || []);
        setTotalPages(response.data.totalPages || 1);
        setTotal(response.data.total || 0);
      }
    } catch (error) {
      toast.error("Failed to load prize rules");
    }
  };

  // ---------------------------------------------------
  // PAGINATION HANDLERS
  // ---------------------------------------------------
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // ---------------------------------------------------
  // FORM HANDLERS
  // ---------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCampaignId || !selectedPrizeId || !formData.probability) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        campaignId: selectedCampaignId,
        prizeId: selectedPrizeId,
        probability: parseFloat(formData.probability),
        maxPerDay: formData.maxPerDay ? parseInt(formData.maxPerDay) : null,
        maxTotal: formData.maxTotal ? parseInt(formData.maxTotal) : null,
        value: formData.value ? parseFloat(formData.value) : null,
      };

      if (editingRule) {
        await prizeRuleAPI.update(editingRule.id, payload);
        toast.success("Prize rule updated successfully");
      } else {
        await prizeRuleAPI.create(payload);
        toast.success("Prize rule created successfully");
      }

      resetForm();
      fetchRules();
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Failed to save prize rule";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (rule) => {
    setEditingRule(rule);
    setSelectedCampaignId(rule.campaignId);
    setSelectedPrizeId(rule.prizeId);
    setFormData({
      probability: rule.probability.toString(),
      maxPerDay: rule.maxPerDay ? rule.maxPerDay.toString() : "",
      maxTotal: rule.maxTotal ? rule.maxTotal.toString() : "",
      value: rule.value ? rule.value.toString() : "",
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this rule?")) return;

    try {
      await prizeRuleAPI.delete(id);
      toast.success("Prize rule deleted successfully");
      fetchRules();
    } catch (error) {
      toast.error("Failed to delete prize rule");
    }
  };

  const resetForm = () => {
    setEditingRule(null);
    setSelectedCampaignId("");
    setSelectedPrizeId("");
    setFormData({
      probability: "",
      maxPerDay: "",
      maxTotal: "",
      value: "",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-20 h-20 border-4 border-gray-200 border-t-[#1ea25cff] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-green-500 to-green-400 bg-clip-text text-transparent mb-2">
            Prize Rules
          </h1>
          <p className="text-gray-600">
            Configure prize probability and limits per campaign
          </p>
        </div>

        {/* FORM */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
              <FaGift className="text-white text-xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              {editingRule ? "Edit Prize Rule" : "Create Prize Rule"}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Campaign Select */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Campaign *
                </label>
                <select
                  value={selectedCampaignId}
                  onChange={(e) => setSelectedCampaignId(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white"
                  required
                  disabled={!!editingRule}
                >
                  <option value="">Select Campaign</option>
                  {campaigns.map((campaign) => (
                    <option key={campaign.id} value={campaign.id}>
                      {campaign.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Prize Select */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Prize *
                </label>
                <select
                  value={selectedPrizeId}
                  onChange={(e) => setSelectedPrizeId(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white"
                  required
                  disabled={!!editingRule}
                >
                  <option value="">Select Prize</option>
                  {prizes.map((prize) => (
                    <option key={prize.id} value={prize.id}>
                      {prize.name} ({prize.type})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Probability */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Probability (0-1) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={formData.probability}
                  onChange={(e) =>
                    setFormData({ ...formData, probability: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
                  placeholder="0.25"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Decimal between 0 and 1 (e.g., 0.25 = 25%)
                </p>
              </div>

              {/* Value */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Prize Value (₦)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.value}
                  onChange={(e) =>
                    setFormData({ ...formData, value: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
                  placeholder="0.00"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Monetary value for budget tracking
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Max Per Day */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Max Total Wins Per Day
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.maxPerDay}
                  onChange={(e) =>
                    setFormData({ ...formData, maxPerDay: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
                  placeholder="Leave blank for unlimited"
                />
              </div>

              {/* Max Total */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Max Total Wins Per Location
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.maxTotal}
                  onChange={(e) =>
                    setFormData({ ...formData, maxTotal: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
                  placeholder="Leave blank for unlimited"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-[#1ea25cff] to-[#1ea25cff] text-white rounded-xl shadow-xl hover:-translate-y-1 transition-all font-semibold disabled:opacity-50"
              >
                <FaPlus />
                {isSubmitting
                  ? "Saving..."
                  : editingRule
                  ? "Update Rule"
                  : "Create Rule"}
              </button>
              {editingRule && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-8 py-4 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-semibold"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* FILTER */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/20">
          <div className="flex items-center gap-3 mb-4">
            <FaBullhorn className="text-[#1ea25cff] text-xl" />
            <h3 className="text-lg font-bold text-gray-800">Filter Rules</h3>
          </div>
          <select
            value={selectedCampaignId}
            onChange={(e) => setSelectedCampaignId(e.target.value)}
            className="w-full md:w-auto px-4 py-3 border-2 border-gray-200 rounded-xl bg-white"
          >
            <option value="">All Campaigns</option>
            {campaigns.map((campaign) => (
              <option key={campaign.id} value={campaign.id}>
                {campaign.name}
              </option>
            ))}
          </select>
        </div>

        {/* RULES TABLE */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden border border-white/20">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Campaign
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Prize
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Probability
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Max/Day
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Max Total
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Value (₦)
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {rules.length > 0 ? (
                  rules.map((rule) => (
                    <tr
                      key={rule.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {rule.campaign?.name || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">
                          {rule.prize?.name || "N/A"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {rule.prize?.type || ""}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-blue-500 to-blue-600 shadow-md">
                          {(parseFloat(rule.probability) * 100).toFixed(2)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {rule.maxPerDay || "∞"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {rule.maxTotal || "∞"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {rule.value
                          ? `₦${parseFloat(rule.value).toFixed(2)}`
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(rule)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          >
                            <FaEdit className="text-sm" />
                          </button>
                          <button
                            onClick={() => handleDelete(rule.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            <FaTrash className="text-sm" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        {selectedCampaignId
                          ? "No rules found for this campaign"
                          : "No prize rules found. Create your first rule above."}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {(currentPage - 1) * limit + 1} to{" "}
                {Math.min(currentPage * limit, total)} of {total} rules
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <FaChevronLeft className="text-xs" />
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (page) =>
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                    )
                    .map((page, index, array) => {
                      if (index > 0 && page - array[index - 1] > 1) {
                        return (
                          <React.Fragment key={`ellipsis-${page}`}>
                            <span className="px-2 text-gray-500">...</span>
                            <button
                              onClick={() => handlePageChange(page)}
                              className={`px-3 py-2 rounded-lg text-sm font-medium ${
                                currentPage === page
                                  ? "bg-[#1ea25cff] text-white"
                                  : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              {page}
                            </button>
                          </React.Fragment>
                        );
                      }
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium ${
                            currentPage === page
                              ? "bg-[#1ea25cff] text-white"
                              : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                </div>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  Next
                  <FaChevronRight className="text-xs" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrizeRules;
