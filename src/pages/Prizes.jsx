import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaPlus, FaEdit, FaTrash, FaGift } from "react-icons/fa";
import { prizeAPI } from "../services/api";
import { toast } from "react-toastify";

const Prizes = () => {
  const [prizes, setPrizes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ---------------------------------------------------
  // FETCH PRIZES
  // ---------------------------------------------------
  useEffect(() => {
    fetchPrizes();
  }, []);

  const fetchPrizes = async () => {
    try {
      const response = await prizeAPI.getAll();
      if (response.data.success) {
        // Handle both array and object responses
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

  // ---------------------------------------------------
  // DELETE PRIZE
  // ---------------------------------------------------
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this prize?")) return;

    try {
      await prizeAPI.delete(id);
      toast.success("Prize deleted successfully");
      fetchPrizes();
    } catch (error) {
      toast.error("Failed to delete prize");
    }
  };

  // ---------------------------------------------------
  // STATUS BADGE
  // ---------------------------------------------------
  const getStatusBadge = (isActive) => {
    return (
      <span
        className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${
          isActive
            ? "bg-green-100 text-green-800"
            : "bg-gray-100 text-gray-800"
        }`}
      >
        {isActive ? "✓ Active" : "✗ Inactive"}
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
              Prizes
            </h1>
            <p className="text-gray-600">
              Manage rewards and prizes for campaigns
            </p>
          </div>

          <Link
            to="/prizes/new"
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1ea25cff] to-[#1ea25cff] text-white rounded-xl hover:shadow-xl transition font-semibold"
          >
            <FaPlus /> New Prize
          </Link>
        </div>

        {/* TABLE */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden border border-white/20">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Prize
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {prizes.map((prize) => (
                  <tr
                    key={prize.id}
                    className="hover:bg-gray-50 transition-colors group"
                  >
                    {/* PRIZE NAME + DESCRIPTION */}
                    <td className="px-6 py-4 whitespace-nowrap w-[500px] max-w-[500px]">
                      <div className="flex items-start gap-3">
                        <div
                          className="p-2 rounded-lg"
                          style={{ backgroundColor: `${prize.color || "#FFD700"}20` }}
                        >
                          <FaGift
                            className="text-lg"
                            style={{ color: prize.color || "#FFD700" }}
                          />
                        </div>
                        <div className="truncate">
                          <div className="text-sm font-bold text-gray-900 group-hover:text-[#1ea25cff] transition-colors truncate">
                            {prize.name}
                          </div>
                          <div className="text-xs text-gray-500 line-clamp-1 truncate">
                            {prize.description || "No description"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* TYPE */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-blue-500 to-blue-600 shadow-md">
                        {prize.type || "N/A"}
                      </span>
                    </td>

                    {/* STATUS */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(prize.isActive)}
                    </td>

                    {/* ACTIONS */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/prizes/edit/${prize.id}`)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          <FaEdit className="text-sm" />
                        </button>

                        <button
                          onClick={() => handleDelete(prize.id)}
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
        {prizes.length === 0 && (
          <div className="text-center py-20 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaGift className="text-5xl text-[#1ea25cff]" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                No prizes found
              </h3>
              <p className="text-gray-600 mb-6">
                Create a new prize to get started
              </p>

              <Link
                to="/prizes/new"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#1ea25cff] to-[#1ea25cff] text-white rounded-xl hover:shadow-xl transition font-semibold text-lg"
              >
                <FaPlus /> Create Prize
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Prizes;
