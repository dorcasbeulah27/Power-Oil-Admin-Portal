import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUsers,
  FaSpinner,
  FaTrophy,
  FaMapMarkerAlt,
  FaBullhorn,
  FaArrowUp,
  FaArrowDown,
  FaChartLine,
  FaFire,
  FaStar,
  FaCrown,
  FaQrcode,
  FaGift,
  FaUserPlus,
  FaPlus,
} from "react-icons/fa";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { analyticsAPI } from "../services/api";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await analyticsAPI.getDashboardStats();

      if (response.data.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-gray-200 border-t-[#1ea25cff] rounded-full animate-spin"></div>
          <FaSpinner className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[#1ea25cff] text-2xl" />
        </div>
      </div>
    );
  }

  const COLORS = [
    "#1ea25cff",
    "#1ea25cff",
    "#10B981",
    "#F59E0B",
    "#3B82F6",
    "#EC4899",
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-green-500 to-green-400 bg-clip-text text-transparent mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Real-time insights and performance metrics
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Scans"
            value={stats?.stats?.totalSpins || 0}
            icon={FaQrcode}
            gradient="from-[#1ea25cff] to-[#1ea25cff]"
            onClick={() => navigate("/reports")}
          />
          <StatCard
            title="Total Registrations"
            value={stats?.stats?.totalUsers || 0}
            icon={FaUsers}
            gradient="from-blue-500 to-blue-600"
          />
          <StatCard
            title="Total Redemptions"
            value={stats?.stats?.totalRedemptions || 0}
            icon={FaGift}
            gradient="from-purple-500 to-purple-600"
            onClick={() => navigate("/reports")}
          />
          <StatCard
            title="Active Campaigns"
            value={stats?.stats?.activeCampaigns || 0}
            icon={FaBullhorn}
            gradient="from-green-500 to-green-600"
            onClick={() => navigate("/campaigns")}
          />
        </div>

        {/* Quick Actions Panel */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/20">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-4">
            <FaPlus className="text-[#1ea25cff]" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate("/campaigns/new")}
              className="group relative overflow-hidden bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="relative z-10">
                <FaBullhorn className="text-3xl mb-3" />
                <h4 className="text-lg font-bold">Create Campaign</h4>
                <p className="text-sm text-white/80 mt-1">Start a new campaign</p>
              </div>
            </button>
            <button
              onClick={() => navigate("/locations/new")}
              className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="relative z-10">
                <FaMapMarkerAlt className="text-3xl mb-3" />
                <h4 className="text-lg font-bold">Add Location</h4>
                <p className="text-sm text-white/80 mt-1">Register a new location</p>
              </div>
            </button>
            <button
              onClick={() => navigate("/prizes/new")}
              className="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="relative z-10">
                <FaGift className="text-3xl mb-3" />
                <h4 className="text-lg font-bold">Add Prize</h4>
                <p className="text-sm text-white/80 mt-1">Create a new prize</p>
              </div>
            </button>
          </div>
        </div>

        {/* Scan Activity Chart */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <FaQrcode className="text-[#1ea25cff]" />
              Scan Activity
            </h3>
            <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
              Last 7 Days
            </span>
          </div>
          {stats?.dailySpins && stats.dailySpins.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.dailySpins}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="date"
                  stroke="#6B7280"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                />
                <YAxis stroke="#6B7280" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "none",
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                  }}
                />
                <Bar
                  dataKey="spins"
                  fill="#1ea25cff"
                  radius={[8, 8, 0, 0]}
                  name="Scans"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400">
              <div className="text-center">
                <FaQrcode className="mx-auto text-4xl mb-2" />
                <p>No scan data available yet</p>
              </div>
            </div>
          )}
        </div>

        {/* Recent Activity & Winners Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden border border-white/20">
            <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FaChartLine className="text-[#1ea25cff]" />
                Recent Activity
              </h3>
            </div>
            {stats?.recentActivity && stats.recentActivity.length > 0 ? (
              <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
                {stats.recentActivity.slice(0, 10).map((activity) => (
                  <div
                    key={`${activity.type}-${activity.id}`}
                    className="px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`p-2 rounded-lg ${
                          activity.type === "scan"
                            ? "bg-blue-100 text-blue-600"
                            : activity.type === "signup"
                            ? "bg-green-100 text-green-600"
                            : "bg-purple-100 text-purple-600"
                        }`}
                      >
                        {activity.type === "scan" && <FaQrcode />}
                        {activity.type === "signup" && <FaUserPlus />}
                        {activity.type === "redemption" && <FaGift />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-gray-900">
                            {activity.user?.fullName || "Unknown User"}
                          </span>
                          <span className="text-xs text-gray-500">
                            {activity.type === "scan" && "scanned"}
                            {activity.type === "signup" && "registered"}
                            {activity.type === "redemption" && "redeemed"}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(activity.date).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-gray-400">
                <div className="text-center">
                  <FaChartLine className="mx-auto text-4xl mb-2" />
                  <p>No recent activity</p>
                </div>
              </div>
            )}
          </div>

          {/* Recent Winners */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden border border-white/20">
            <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FaCrown className="text-yellow-500" />
                Recent Winners
              </h3>
            </div>
            {stats?.recentWinners && stats.recentWinners.length > 0 ? (
              <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
                {stats.recentWinners.slice(0, 10).map((winner) => (
                  <div
                    key={winner.id}
                    className="px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold">
                        {winner.user?.fullName?.charAt(0) || "?"}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-gray-900">
                          {winner.user?.fullName || "Unknown"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {winner.prize?.name || "Unknown Prize"}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(winner.spinDate).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-gray-400">
                <div className="text-center">
                  <FaCrown className="mx-auto text-4xl mb-2" />
                  <p>No winners yet</p>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, gradient, onClick }) => {
  const handleKeyDown = (e) => {
    if (!onClick) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`group relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
      ></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div
            className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}
          >
            <Icon className="text-white text-2xl" />
          </div>
        </div>
        <p className="text-gray-600 text-sm font-medium mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900">
          {value.toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
