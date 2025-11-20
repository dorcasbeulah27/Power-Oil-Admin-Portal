import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { locationAPI, campaignAPI } from "../services/api";
import {
  FaSave,
  FaTimes,
  FaMapMarkerAlt,
  FaSearch,
  FaMapPin,
  FaCog,
  FaBullhorn,
} from "react-icons/fa";

const LocationForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaignIds, setSelectedCampaignIds] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  // Refs for managing search timeout and abort controller
  const typingTimeoutRef = useRef(null);
  const abortControllerRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    type: "",
    latitude: "",
    longitude: "",
    radiusTolerance: 100,
    maxPremiumPrizesPerWeek: 25,
    isActive: true,
  });

  // ---------------------------------------------------
  // FETCH CAMPAIGNS
  // ---------------------------------------------------
  useEffect(() => {
    fetchCampaigns();
    if (isEdit) fetchLocation();

    // Cleanup: cancel any pending search requests on unmount
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [id]);

  const fetchCampaigns = async () => {
    try {
      const response = await campaignAPI.getAll();
      if (response.data.success) {
        setCampaigns(response.data.campaigns || []);
      }
    } catch (error) {
      console.error("Failed to load campaigns:", error);
    }
  };

  const fetchLocation = async () => {
    try {
      const response = await locationAPI.getById(id);
      if (response.data.success) {
        const loc = response.data.location || response.data.data;

        setFormData({
          name: loc.name || "",
          address: loc.address || "",
          city: loc.city || "",
          state: loc.state || "",
          type: loc.type || "",
          latitude: loc.latitude || "",
          longitude: loc.longitude || "",
          radiusTolerance: loc.radiusTolerance || 100,
          maxPremiumPrizesPerWeek: loc.maxPremiumPrizesPerWeek || 25,
          isActive: loc.isActive ?? true,
        });

        setSearchText(loc.address || "");

        // Set selected campaign IDs
        if (loc.campaignIds && Array.isArray(loc.campaignIds)) {
          setSelectedCampaignIds(loc.campaignIds);
        } else if (loc.campaigns && Array.isArray(loc.campaigns)) {
          setSelectedCampaignIds(loc.campaigns.map((c) => c.id));
        }
      }
    } catch (error) {
      toast.error("Failed to load location");
    }
  };

  // ---------------------------------------------------
  // SEARCH LOCATION (Nominatim) with retry logic
  // ---------------------------------------------------
  const searchLocationWithRetry = async (query, retries = 2) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=7&q=${encodeURIComponent(
      query
    )}`;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // Add timeout
        const timeoutId = setTimeout(() => {
          if (abortControllerRef.current) {
            abortControllerRef.current.abort();
          }
        }, 10000); // 10 second timeout

        const res = await fetch(url, {
          signal: abortControllerRef.current.signal,
          headers: {
            "User-Agent": "Power-Oil-Admin/1.0", // Required by Nominatim
            Accept: "application/json",
          },
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();

        if (Array.isArray(data)) {
          setSuggestions(data);
          setSearchError("");
          return;
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err) {
        if (err.name === "AbortError") {
          // Request was cancelled, don't retry
          return;
        }

        if (attempt === retries) {
          // Last attempt failed
          console.error("Location search failed after retries:", err);
          setSearchError(
            "Location search unavailable. Please enter coordinates manually."
          );
          setSuggestions([]);
          toast.error(
            "Location search service is temporarily unavailable. You can still enter coordinates manually.",
            { autoClose: 5000 }
          );
        } else {
          // Wait before retry (exponential backoff)
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, attempt) * 1000)
          );
        }
      }
    }
  };

  const searchLocation = (query) => {
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(async () => {
      if (query.length < 3) {
        setSuggestions([]);
        setSearchError("");
        setSearching(false);
        return;
      }

      setSearching(true);
      setSearchError("");
      await searchLocationWithRetry(query);
      setSearching(false);
    }, 500); // Increased debounce to reduce API calls
  };

  // ---------------------------------------------------
  // SELECT SUGGESTION
  // ---------------------------------------------------
  const selectLocation = (item) => {
    setSuggestions([]);
    setSearchText(item.display_name);

    setFormData({
      ...formData,
      address: item.display_name,
      latitude: item.lat,
      longitude: item.lon,
      state: item.address?.state || "",
      city:
        item.address?.city ||
        item.address?.town ||
        item.address?.state_district ||
        "",
    });
  };

  // ---------------------------------------------------
  // SUBMIT HANDLER
  // ---------------------------------------------------
  const handleSubmit = async () => {
    setLoading(true);

    try {
      const payload = {
        ...formData,
        coordinates: {
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
        },
        campaignIds: selectedCampaignIds,
      };

      if (isEdit) {
        await locationAPI.update(id, payload);
        toast.success("Location updated successfully");
      } else {
        await locationAPI.create(payload);
        toast.success("Location created successfully");
      }

      navigate("/locations");
    } catch (error) {
      toast.error("Failed to save location");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------
  // HANDLE CAMPAIGN SELECTION
  // ---------------------------------------------------
  const handleCampaignToggle = (campaignId) => {
    setSelectedCampaignIds((prev) => {
      if (prev.includes(campaignId)) {
        return prev.filter((id) => id !== campaignId);
      } else {
        return [...prev, campaignId];
      }
    });
  };

  // ---------------------------------------------------
  // UI COMPONENT
  // ---------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto overflow-visible">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-green-500 to-green-400 bg-clip-text text-transparent mb-2">
            {isEdit ? "Edit Location" : "Add New Location"}
          </h1>
          <p className="text-gray-600">
            Add or update a campaign location with coordinates
          </p>
        </div>

        <div className="space-y-6 overflow-visible">
          {/* SEARCH LOCATION */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/20 relative z-20 overflow-visible">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-[#1ea25cff] rounded-xl">
                <FaSearch className="text-white text-xl" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                Search Location
              </h2>
            </div>

            <div className="relative">
              <FaMapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              {searching && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <div className="w-5 h-5 border-2 border-green-200 border-t-[#1ea25cff] rounded-full animate-spin"></div>
                </div>
              )}

              <input
                type="text"
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  searchLocation(e.target.value);
                }}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-lg"
                placeholder="Search for a place (e.g., Shoprite Ikeja)"
                disabled={searching}
              />

              {searchError && (
                <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">{searchError}</p>
                  <p className="text-xs text-yellow-600 mt-1">
                    You can still enter the address and coordinates manually
                    below.
                  </p>
                </div>
              )}

              {suggestions.length > 0 && !searching && (
                <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-2xl max-h-80 overflow-y-auto">
                  {suggestions.map((item, i) => (
                    <div
                      key={i}
                      onClick={() => selectLocation(item)}
                      className="p-4 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-start gap-3">
                        <FaMapMarkerAlt className="text-[#1ea25cff] mt-1" />
                        <div>
                          <div className="font-semibold text-gray-800">
                            {item.display_name}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {item.address?.city ||
                              item.address?.town ||
                              item?.address?.state_district}
                            ,{item.address?.state || item.address?.country}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {searching && suggestions.length === 0 && (
                <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-2xl p-4">
                  <div className="flex items-center gap-3 text-gray-600">
                    <div className="w-5 h-5 border-2 border-green-200 border-t-[#1ea25cff] rounded-full animate-spin"></div>
                    <span className="text-sm">Searching locations...</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* LOCATION DETAILS */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl">
                <FaMapMarkerAlt className="text-white text-xl" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                Location Details
              </h2>
            </div>

            <div className="space-y-6">
              {/* NAME */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Location Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* ADDRESS */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Address *
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  rows="2"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* STATE / CITY / TYPE */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
                  />
                </div>

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
                    <option value="moderntrade">Modern Trade</option>
                    <option value="openmarket">Open Market</option>
                    <option value="supermarket">Supermarket</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* COORDINATES */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
                <FaMapPin className="text-white text-xl" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Coordinates</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Latitude *
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) =>
                    setFormData({ ...formData, latitude: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Longitude *
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) =>
                    setFormData({ ...formData, longitude: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl font-mono"
                />
              </div>
            </div>
          </div>

          {/* CAMPAIGNS */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                <FaBullhorn className="text-white text-xl" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                Linked Campaigns
              </h2>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Select Campaigns (Optional)
              </label>
              <div className="border-2 border-gray-200 rounded-xl p-4 max-h-64 overflow-y-auto">
                {campaigns.length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    No campaigns available
                  </p>
                ) : (
                  <div className="space-y-2">
                    {campaigns.map((campaign) => (
                      <label
                        key={campaign.id}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCampaignIds.includes(campaign.id)}
                          onChange={() => handleCampaignToggle(campaign.id)}
                          className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-gray-800">
                            {campaign.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {campaign.status} • {campaign.totalSpins || 0} spins
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              {selectedCampaignIds.length > 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  {selectedCampaignIds.length} campaign
                  {selectedCampaignIds.length !== 1 ? "s" : ""} selected
                </p>
              )}
            </div>
          </div>

          {/* ADVANCED SETTINGS */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl">
                <FaCog className="text-white text-xl" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                Advanced Settings
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Radius Tolerance (meters)
                </label>
                <input
                  type="number"
                  value={formData.radiusTolerance}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      radiusTolerance: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
                />
              </div>

              {/* <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Max Premium Prizes/Week
                </label>
                <input
                  type="number"
                  value={formData.maxPremiumPrizesPerWeek}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxPremiumPrizesPerWeek: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
                />
              </div> */}
            </div>

            <div className="mt-6">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="w-5 h-5 text-green-600 rounded"
                />
                <span className="text-sm font-semibold text-gray-700 group-hover:text-green-600">
                  ✓ Location is Active
                </span>
              </label>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex gap-4">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-[#1ea25cff] to-[#1ea25cff] text-white rounded-xl hover:shadow-xl transition font-bold text-lg disabled:opacity-50"
            >
              <FaSave />
              {loading
                ? isEdit
                  ? "Updating Location..."
                  : "Adding Location..."
                : isEdit
                ? "Update Location"
                : "Add Location"}
            </button>

            <button
              onClick={() => navigate("/locations")}
              className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-bold text-lg"
            >
              <FaTimes className="inline mr-2" />
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationForm;
