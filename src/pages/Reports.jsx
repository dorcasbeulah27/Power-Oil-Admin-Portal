import React, { useState, useEffect } from "react";
import {
  FaChartLine,
  FaMapMarkerAlt,
  FaTrophy,
  FaSpinner,
  FaUser,
  FaDownload,
} from "react-icons/fa";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { analyticsAPI, campaignAPI } from "../services/api";
import { exportToCSV } from "../utils/exportUtils";

const Reports = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const [timePeriod, setTimePeriod] = useState("7days");

  // Registered Users Report state
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [registeredUsersLoading, setRegisteredUsersLoading] = useState(false);
  const [registeredUsersTotal, setRegisteredUsersTotal] = useState(0);

  // Winning Details Report state
  const [winningDetails, setWinningDetails] = useState([]);
  const [winningDetailsLoading, setWinningDetailsLoading] = useState(false);
  const [winningDetailsTotal, setWinningDetailsTotal] = useState(0);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  useEffect(() => {
    fetchDashboardStats();
  }, [selectedCampaignId, timePeriod]);

  useEffect(() => {
    fetchRegisteredUsers();
    fetchWinningDetails();
  }, [selectedCampaignId, timePeriod]);

  const fetchCampaigns = async () => {
    try {
      const response = await campaignAPI.getAll();
      if (response.data.success) {
        setCampaigns(response.data.campaigns || []);
      }
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const params = {};
      if (selectedCampaignId) params.campaignId = selectedCampaignId;

      // Calculate date range based on time period
      const now = new Date();
      let startDate, endDate;

      switch (timePeriod) {
        case "24hrs":
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          endDate = now;
          break;
        case "7days":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          endDate = now;
          break;
        case "30days":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          endDate = now;
          break;
        case "90days":
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          endDate = now;
          break;
        default:
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          endDate = now;
      }

      params.startDate = startDate.toISOString().split("T")[0];
      params.endDate = endDate.toISOString().split("T")[0];

      const response = await analyticsAPI.getReportsStats(params);

      if (response.data.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDateRange = () => {
    const now = new Date();
    let startDate, endDate;

    switch (timePeriod) {
      case "24hrs":
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        endDate = now;
        break;
      case "7days":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = now;
        break;
      case "30days":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        endDate = now;
        break;
      case "90days":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        endDate = now;
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = now;
    }

    return {
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    };
  };

  const fetchRegisteredUsers = async (forExport = false) => {
    setRegisteredUsersLoading(true);
    try {
      const params = {};
      if (selectedCampaignId) params.campaignId = selectedCampaignId;
      const dateRange = getDateRange();
      params.startDate = dateRange.startDate;
      params.endDate = dateRange.endDate;

      // Limit to 10 for display, no limit for export
      if (!forExport) {
        params.limit = 10;
      }

      const response = await analyticsAPI.getRegisteredUsersReport(params);
      if (response.data.success) {
        setRegisteredUsers(response.data.users || []);
        setRegisteredUsersTotal(response.data.total || 0);
        return response.data.users || [];
      }
      return [];
    } catch (error) {
      console.error("Error fetching registered users:", error);
      return [];
    } finally {
      setRegisteredUsersLoading(false);
    }
  };

  const fetchWinningDetails = async (forExport = false) => {
    setWinningDetailsLoading(true);
    try {
      const params = {};
      if (selectedCampaignId) params.campaignId = selectedCampaignId;
      const dateRange = getDateRange();
      params.startDate = dateRange.startDate;
      params.endDate = dateRange.endDate;

      // Limit to 10 for display, no limit for export
      if (!forExport) {
        params.limit = 10;
      }

      const response = await analyticsAPI.getWinningDetailsReport(params);
      if (response.data.success) {
        setWinningDetails(response.data.spins || []);
        setWinningDetailsTotal(response.data.total || 0);
        return response.data.spins || [];
      }
      return [];
    } catch (error) {
      console.error("Error fetching winning details:", error);
      return [];
    } finally {
      setWinningDetailsLoading(false);
    }
  };

  const handleExportRegisteredUsers = async () => {
    try {
      // Fetch full data for export
      const fullData = await fetchRegisteredUsers(true);
      const headers = [
        { key: "phoneNumber", label: "Phone Number" },
        { key: "name", label: "Name" },
        { key: "email", label: "Email" },
        { key: "gender", label: "Gender" },
        { key: "location", label: "Location" },
        { key: "dateAndTime", label: "Date and Time" },
      ];
      await exportToCSV(fullData, headers, "registered-users");
    } catch (error) {
      console.error("Error exporting registered users:", error);
    }
  };

  const handleExportWinningDetails = async () => {
    try {
      // Fetch full data for export
      const fullData = await fetchWinningDetails(true);
      const headers = [
        { key: "phoneNumber", label: "Phone Number" },
        { key: "name", label: "Name" },
        { key: "location", label: "Location" },
        { key: "dateAndTime", label: "Date and Time" },
        { key: "prizeWon", label: "Prize Won" },
        { key: "couponCode", label: "Coupon Code" },
        { key: "campaignName", label: "Campaign Name" },
        { key: "prizeValue", label: "Prize Value" },
        { key: "status", label: "Redemption Status" },
      ];
      await exportToCSV(fullData, headers, "winning-details");
    } catch (error) {
      console.error("Error exporting winning details:", error);
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-green-500 to-green-400 bg-clip-text text-transparent mb-2">
            Reports
          </h1>
          <p className="text-gray-600">
            Comprehensive analytics and performance metrics
          </p>
        </div>

        {/* Reports Section */}
        <div className="bg-white/0 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/20">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-4">
              <FaChartLine className="text-[#1ea25cff]" />
              Reports
            </h2>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Period
                </label>
                <select
                  value={timePeriod}
                  onChange={(e) => setTimePeriod(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white focus:border-[#1ea25cff] focus:outline-none transition-colors"
                >
                  <option value="24hrs">Last 24 Hours</option>
                  <option value="7days">Last 7 Days</option>
                  <option value="30days">Last 30 Days</option>
                  <option value="90days">Last 90 Days</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign
                </label>
                <select
                  value={selectedCampaignId}
                  onChange={(e) => setSelectedCampaignId(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white focus:border-[#1ea25cff] focus:outline-none transition-colors"
                >
                  <option value="">All Campaigns</option>
                  {campaigns.map((campaign) => (
                    <option key={campaign.id} value={campaign.id}>
                      {campaign.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-1">Total Scans</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.stats?.totalSpins?.toLocaleString() || 0}
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-1">
                  Total Registrations
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.stats?.totalUsers?.toLocaleString() || 0}
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-1">Total Redemptions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.stats?.totalRedemptions?.toLocaleString() || 0}
                </p>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-1">
                  Scan → Registration %
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.stats?.scanToRegistrationRate || 0}%
                </p>
              </div>
              <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-1">
                  Registration → Redemption %
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.stats?.registrationToRedemptionRate || 0}%
                </p>
              </div>
            </div>

            {/* Top Performing Locations & Prize Distribution Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Top Performing Locations */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
                  <FaMapMarkerAlt className="text-red-500" />
                  Top Performing Locations
                </h3>
                {stats?.topLocationsByScans &&
                stats.topLocationsByScans.length > 0 ? (
                  <div className="space-y-3">
                    {stats.topLocationsByScans
                      .slice(0, 10)
                      .map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-white rounded-lg"
                        >
                          <span className="text-sm font-medium text-gray-700">
                            {item.location}
                          </span>
                          <span className="text-sm font-bold text-[#1ea25cff]">
                            {item.scans?.toLocaleString() || 0} scans
                          </span>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-8">
                    <FaMapMarkerAlt className="mx-auto text-4xl mb-2" />
                    <p>No location data available</p>
                  </div>
                )}
              </div>

              {/* Prize Distribution by Type */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
                  <FaTrophy className="text-yellow-500" />
                  Prize Distribution
                </h3>
                {stats?.prizeDistributionByType &&
                stats.prizeDistributionByType.length > 0 ? (
                  <div className="space-y-3">
                    {stats.prizeDistributionByType.map((item, index) => (
                      <div key={index} className="p-3 bg-white rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700 capitalize">
                            {item.name || item.type}
                          </span>
                          <span className="text-sm font-bold text-[#1ea25cff]">
                            {item.percentage}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-[#1ea25cff] to-green-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {item.count} prizes won
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-8">
                    <FaTrophy className="mx-auto text-4xl mb-2" />
                    <p>No prize distribution data</p>
                  </div>
                )}
              </div>
            </div>

            {/* Activity Over Time Graph */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
                <FaChartLine className="text-[#1ea25cff]" />
                Hourly Activity (Last 24 Hours)
              </h3>
              {stats?.hourlyActivity && stats.hourlyActivity.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.hourlyActivity}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                      dataKey="timeRange"
                      stroke="#6B7280"
                      tick={{ fontSize: 10 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
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
                    <Legend />
                    <Bar
                      dataKey="scans"
                      fill="#1ea25cff"
                      name="Total Scans"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="registrations"
                      fill="#10B981"
                      name="Registrations"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="spins"
                      fill="#F59E0B"
                      name="Total Spins"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-400">
                  <div className="text-center">
                    <FaChartLine className="mx-auto text-4xl mb-2" />
                    <p>No activity data available</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Registered Users Report Section */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/20">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-2">
                <FaUser className="text-[#1ea25cff]" />
                Registered User Details Report
              </h2>
              <p className="text-sm text-gray-600">
                Complete list of all registered users with their details
              </p>
            </div>
            <button
              onClick={handleExportRegisteredUsers}
              disabled={registeredUsersLoading || registeredUsers.length === 0}
              className="px-4 py-2 bg-[#1ea25cff] hover:bg-green-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <FaDownload />
              Export CSV
            </button>
          </div>

          {registeredUsersLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-green-200 border-t-[#1ea25cff] rounded-full animate-spin"></div>
            </div>
          ) : registeredUsers.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <FaUser className="mx-auto text-4xl mb-2" />
              <p>No registered users found for the selected filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Phone Number
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Gender
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Date and Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {registeredUsers.map((user, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.phoneNumber}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {user.name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {user.email || "N/A"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {user.gender || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {user.location || "N/A"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {user.dateAndTime}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 text-sm text-gray-600 px-4">
                {registeredUsersTotal > 10 ? (
                  <span>
                    Showing first 10 of {registeredUsersTotal} registered users.
                    Click "Export CSV" to download the full report.
                  </span>
                ) : (
                  <span>Total: {registeredUsersTotal} registered users</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Winning Details Report Section */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/20">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-2">
                <FaTrophy className="text-[#1ea25cff]" />
                Winning Details Report
              </h2>
              <p className="text-sm text-gray-600">
                Complete list of all spins including wins and "Better Luck Next
                Time" cases
              </p>
            </div>
            <button
              onClick={handleExportWinningDetails}
              disabled={winningDetailsLoading || winningDetails.length === 0}
              className="px-4 py-2 bg-[#1ea25cff] hover:bg-green-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <FaDownload />
              Export CSV
            </button>
          </div>

          {winningDetailsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-green-200 border-t-[#1ea25cff] rounded-full animate-spin"></div>
            </div>
          ) : winningDetails.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <FaTrophy className="mx-auto text-4xl mb-2" />
              <p>No spin results found for the selected filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Phone Number
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Date and Time
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Prize Details
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Coupon Code
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Campaign Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Prize Value
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Redemption Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {winningDetails.map((spin, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {spin.phoneNumber}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {spin.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {spin.location || "N/A"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {spin.dateAndTime}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <span
                          className={`font-medium ${
                            spin.prizeWon === "Better Luck Next Time"
                              ? "text-gray-600"
                              : "text-green-600"
                          }`}
                        >
                          {spin.prizeWon}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-600">
                        {spin.couponCode || "-"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {spin.campaignName}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        ${spin.prizeValue?.toLocaleString() || "0"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        {spin.status === "redeemed" ? (
                          <span className="text-green-600 font-medium">
                            Redeemed
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 text-sm text-gray-600 px-4">
                {winningDetailsTotal > 10 ? (
                  <span>
                    Showing first 10 of {winningDetailsTotal} spin results.
                    Click "Export CSV" to download the full report.
                  </span>
                ) : (
                  <span>Total: {winningDetailsTotal} spin results</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
