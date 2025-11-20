import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaMapMarkerAlt,
  FaMapPin,
  FaChevronLeft,
  FaChevronRight,
  FaUpload,
  FaDownload,
  FaTimes,
} from "react-icons/fa";
import ExcelJS from "exceljs";
import { locationAPI, campaignAPI } from "../services/api";
import { toast } from "react-toastify";

const Locations = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadResults, setUploadResults] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const navigate = useNavigate();

  // ---------------------------------------------------
  // FETCH LOCATIONS (original API)
  // ---------------------------------------------------
  useEffect(() => {
    fetchLocations();
    fetchCampaigns();
  }, [currentPage]);

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

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const response = await locationAPI.getAll({ page: currentPage, limit });
      if (response.data.success) {
        setLocations(response.data.locations);
        setTotalPages(response.data.totalPages || 1);
        setTotal(response.data.total || 0);
      }
    } catch (error) {
      toast.error("Failed to load locations");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------
  // DELETE LOCATION
  // ---------------------------------------------------
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this location?"))
      return;

    try {
      await locationAPI.delete(id);
      toast.success("Location deleted successfully");
      fetchLocations();
    } catch (error) {
      toast.error("Failed to delete location");
    }
  };

  // ---------------------------------------------------
  // STYLING HELPERS
  // ---------------------------------------------------
  const getTypeColor = (type) => {
    const colors = {
      supermarket: "from-blue-500 to-blue-600",
      moderntrade: "from-emerald-500 to-emerald-600",
      openmarket: "from-green-500 to-green-600",
      other: "from-gray-500 to-gray-600",
    };
    return colors[type] || colors.other;
  };

  const getTypeName = (type) => {
    const names = {
      supermarket: "Supermarket",
      moderntrade: "Modern Trade",
      openmarket: "Open Market",
      other: "Other",
    };
    return names[type] || "Unknown";
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
  // BULK UPLOAD HANDLERS
  // ---------------------------------------------------
  const handleDownloadTemplate = async () => {
    try {
      // Fetch campaigns if not already loaded
      let campaignsList = campaigns;
      if (campaignsList.length === 0) {
        const response = await campaignAPI.getAll();
        if (response.data.success) {
          campaignsList = response.data.campaigns || [];
        }
      }

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Locations Template");

      // Define headers
      const headers = [
        "name",
        "address",
        "city",
        "state",
        "type",
        "latitude",
        "longitude",
        "radiusMeters",
        "isActive",
        "contactPerson",
        "contactPhone",
        "campaignName",
      ];

      // Add header row with styling
      const headerRow = worksheet.addRow(headers);
      headerRow.font = { bold: true };
      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE0E0E0" },
      };
      headerRow.alignment = { horizontal: "center", vertical: "middle" };

      // Get campaign names for dropdown
      const campaignNames = campaignsList.map((c) => c.name);
      const exampleCampaignName =
        campaignNames.length > 0 ? campaignNames[0] : "";

      // Add example row
      const exampleRow = [
        "Power Oil Store 1",
        "123 Main Street",
        "Lagos",
        "Lagos",
        "supermarket",
        "6.5244",
        "3.3792",
        "500",
        "true",
        "John Doe",
        "08012345678",
        exampleCampaignName,
      ];
      worksheet.addRow(exampleRow);

      // Set column widths
      worksheet.columns = [
        { width: 20 }, // name
        { width: 30 }, // address
        { width: 15 }, // city
        { width: 15 }, // state
        { width: 15 }, // type
        { width: 12 }, // latitude
        { width: 12 }, // longitude
        { width: 15 }, // radiusMeters
        { width: 12 }, // isActive
        { width: 20 }, // contactPerson
        { width: 15 }, // contactPhone
        { width: 30 }, // campaignName
      ];

      // Add data validation dropdown for campaignName column (column L = 12)
      if (campaignNames.length > 0) {
        // Create a hidden sheet with campaign names
        const validationSheet = workbook.addWorksheet("_CampaignList");
        campaignNames.forEach((name, index) => {
          validationSheet.getCell(index + 1, 1).value = name;
        });
        validationSheet.state = "hidden";
        
        // Use sheet reference for validation (Excel format)
        const validationRange = `'_CampaignList'!$A$1:$A$${campaignNames.length}`;
        
        // Add validation to each cell individually (more reliable)
        const startRow = 2;
        const endRow = 1000;
        const column = 12; // Column L
        
        for (let rowNum = startRow; rowNum <= endRow; rowNum++) {
          const cellAddress = worksheet.getCell(rowNum, column).address;
          worksheet.dataValidations.add(cellAddress, {
            type: "list",
            allowBlank: true,
            formulae: [validationRange],
            showErrorMessage: true,
            errorTitle: "Invalid Campaign",
            error: "Please select a valid campaign name from the dropdown",
          });
        }
      }

      // Generate Excel file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "location_template.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Template downloaded successfully");
    } catch (error) {
      console.error("Download template error:", error);
      toast.error("Failed to generate template");
    }
  };

  const parseCSV = (text) => {
    const lines = text.split("\n").filter((line) => line.trim());
    if (lines.length < 2) {
      throw new Error("CSV file must have at least a header row and one data row");
    }

    // Parse header
    const headers = lines[0]
      .split(",")
      .map((h) => h.trim().replace(/^"|"$/g, ""));

    // Parse data rows
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Simple CSV parsing (handles quoted values)
      const values = [];
      let current = "";
      let inQuotes = false;

      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          values.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      values.push(current.trim()); // Add last value

      // Create object from headers and values
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || "";
      });
      rows.push(row);
    }

    return rows;
  };

  const convertCampaignNamesToIds = async (parsedData) => {
    // Fetch campaigns if not already loaded
    let campaignsList = campaigns;
    if (campaignsList.length === 0) {
      const response = await campaignAPI.getAll();
      if (response.data.success) {
        campaignsList = response.data.campaigns || [];
      }
    }

    // Create a map of campaign name to ID
    const campaignMap = new Map();
    campaignsList.forEach((campaign) => {
      campaignMap.set(campaign.name.toLowerCase().trim(), campaign.id);
    });

    // Convert campaign names to IDs
    const convertedData = parsedData.map((row, index) => {
      const newRow = { ...row };
      
      // Handle campaignName field (new format)
      if (row.campaignName) {
        const campaignName = row.campaignName.trim();
        if (campaignName) {
          const campaignId = campaignMap.get(campaignName.toLowerCase());
          if (campaignId) {
            newRow.campaignIds = campaignId;
          } else {
            throw new Error(
              `Row ${index + 2}: Campaign "${campaignName}" not found. Please use a valid campaign name.`
            );
          }
        }
        // Remove campaignName as backend expects campaignIds
        delete newRow.campaignName;
      }
      
      // Handle campaignIds field (backward compatibility - can be comma-separated names or IDs)
      if (row.campaignIds && !row.campaignName) {
        const campaignIdsValue = row.campaignIds.trim();
        if (campaignIdsValue) {
          // Check if it's UUIDs (IDs) or names
          const parts = campaignIdsValue.split(",").map((p) => p.trim());
          const convertedIds = parts.map((part) => {
            // If it looks like a UUID, use it directly
            if (
              /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
                part
              )
            ) {
              return part;
            }
            // Otherwise, treat as campaign name
            const campaignId = campaignMap.get(part.toLowerCase());
            if (!campaignId) {
              throw new Error(
                `Row ${index + 2}: Campaign "${part}" not found. Please use a valid campaign name.`
              );
            }
            return campaignId;
          });
          newRow.campaignIds = convertedIds;
        }
      }

      return newRow;
    });

    return convertedData;
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check if it's CSV or Excel
    const isCSV =
      file.type === "text/csv" ||
      file.name.endsWith(".csv") ||
      file.type === "application/vnd.ms-excel";
    const isExcel =
      file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.name.endsWith(".xlsx") ||
      file.name.endsWith(".xls");

    if (!isCSV && !isExcel) {
      toast.error("Please select a CSV or Excel file");
      return;
    }

    try {
      let parsedData = [];

      if (isCSV) {
        // Parse CSV
        const text = await file.text();
        parsedData = parseCSV(text);
      } else {
        // Parse Excel
        const workbook = new ExcelJS.Workbook();
        const buffer = await file.arrayBuffer();
        await workbook.xlsx.load(buffer);
        const worksheet = workbook.getWorksheet(1) || workbook.worksheets[0];

        if (!worksheet) {
          throw new Error("Excel file is empty");
        }

        // Get headers from first row
        const headerRow = worksheet.getRow(1);
        const headers = [];
        headerRow.eachCell({ includeEmpty: false }, (cell) => {
          headers.push(cell.value?.toString().trim() || "");
        });

        // Parse data rows
        for (let i = 2; i <= worksheet.rowCount; i++) {
          const row = worksheet.getRow(i);
          const rowData = {};
          let hasData = false;

          headers.forEach((header, index) => {
            const cell = row.getCell(index + 1);
            const value = cell.value;
            rowData[header] =
              value !== null && value !== undefined
                ? value.toString().trim()
                : "";
            if (rowData[header]) hasData = true;
          });

          if (hasData) {
            parsedData.push(rowData);
          }
        }
      }

      if (parsedData.length === 0) {
        toast.error("No data found in file");
        return;
      }

      // Convert campaign names to IDs
      const convertedData = await convertCampaignNamesToIds(parsedData);

      setUploadFile({ file, parsedData: convertedData });
      toast.success(`Parsed ${convertedData.length} location(s) from file`);
    } catch (error) {
      console.error("File parsing error:", error);
      toast.error(`Failed to parse file: ${error.message}`);
    }
  };

  const handleBulkUpload = async () => {
    if (!uploadFile || !uploadFile.parsedData) {
      toast.error("Please select and parse a file first");
      return;
    }

    setUploading(true);
    setUploadResults(null);

    try {
      const response = await locationAPI.bulkUpload(uploadFile.parsedData);
      if (response.data.success) {
        toast.success(
          `Successfully uploaded ${response.data.created} location(s)`
        );
        setUploadResults(response.data);
        setUploadFile(null);
        // Reset file input
        const fileInput = document.getElementById("csv-file-input");
        if (fileInput) fileInput.value = "";
        // Refresh locations list
        fetchLocations();
      }
    } catch (error) {
      console.error("Bulk upload error:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to upload locations";
      toast.error(errorMessage);
      if (error.response?.data?.details) {
        setUploadResults(error.response.data);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleCloseBulkUpload = () => {
    setShowBulkUpload(false);
    setUploadFile(null);
    setUploadResults(null);
    const fileInput = document.getElementById("csv-file-input");
    if (fileInput) fileInput.value = "";
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
              Locations
            </h1>
            <p className="text-gray-600">
              Manage campaign locations and outlets
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowBulkUpload(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:shadow-xl transition font-semibold"
            >
              <FaUpload /> Bulk Upload
            </button>
            <Link
              to="/locations/new"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1ea25cff] to-[#1ea25cff] text-white rounded-xl hover:shadow-xl transition font-semibold"
            >
              <FaPlus /> Add Location
            </Link>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden border border-white/20">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    City/State
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Coordinates
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
                {locations.map((location) => (
                  <tr
                    key={location.id}
                    className="hover:bg-gray-50 transition-colors group"
                  >
                    {/* LOCATION NAME */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-red-100 to-pink-100 rounded-lg">
                          <FaMapMarkerAlt className="text-red-600 text-lg" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900 group-hover:text-[#1ea25cff] transition-colors">
                            {location.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {location.address}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* CITY / STATE */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {location.city}
                      </div>
                      <div className="text-xs text-gray-500">
                        {location.state}
                      </div>
                    </td>

                    {/* TYPE */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r ${getTypeColor(
                          location.type
                        )} shadow-md`}
                      >
                        {getTypeName(location.type)}
                      </span>
                    </td>

                    {/* COORDINATES */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FaMapPin className="text-[#1ea25cff] text-xs" />
                        <span className="font-mono text-xs">
                          {(() => {
                            // Handle both formats: coordinates object or separate latitude/longitude
                            let lat, lng;
                            if (location.coordinates) {
                              lat = location.coordinates.latitude;
                              lng = location.coordinates.longitude;
                            } else if (location.latitude && location.longitude) {
                              lat = location.latitude;
                              lng = location.longitude;
                            }
                            
                            if (lat != null && lng != null) {
                              return `${parseFloat(lat).toFixed(4)}, ${parseFloat(lng).toFixed(4)}`;
                            }
                            return "N/A";
                          })()}
                        </span>
                      </div>
                    </td>

                    {/* STATUS */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${
                          location.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {location.isActive ? "✓ Active" : "✗ Inactive"}
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() =>
                            navigate(`/locations/edit/${location.id}`)
                          }
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          <FaEdit className="text-sm" />
                        </button>

                        <button
                          onClick={() => handleDelete(location.id)}
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
          
          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {(currentPage - 1) * limit + 1} to{" "}
                {Math.min(currentPage * limit, total)} of {total} locations
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

        {/* EMPTY STATE */}
        {locations.length === 0 && !loading && (
          <div className="text-center py-20 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaMapMarkerAlt className="text-5xl text-[#1ea25cff]" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                No locations found
              </h3>
              <p className="text-gray-600 mb-6">
                Add your first location to get started
              </p>

              <Link
                to="/locations/new"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#1ea25cff] to-[#1ea25cff] text-white rounded-xl hover:shadow-xl transition font-semibold text-lg"
              >
                <FaPlus /> Add Your First Location
              </Link>
            </div>
          </div>
        )}

        {/* BULK UPLOAD MODAL */}
        {showBulkUpload && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">
                  Bulk Upload Locations
                </h2>
                <button
                  onClick={handleCloseBulkUpload}
                  className="text-gray-500 hover:text-gray-700 transition"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Download Template Section */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-blue-900 mb-1">
                        Download Template
                      </h3>
                      <p className="text-sm text-blue-700">
                        Download the CSV template to see the required format
                      </p>
                    </div>
                    <button
                      onClick={handleDownloadTemplate}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                    >
                      <FaDownload /> Download
                    </button>
                  </div>
                </div>

                {/* File Upload Section */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Select CSV or Excel File
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition">
                    <input
                      id="csv-file-input"
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <label
                      htmlFor="csv-file-input"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <FaUpload className="text-4xl text-gray-400 mb-2" />
                      <span className="text-gray-600 font-medium">
                        {uploadFile?.file
                          ? `${uploadFile.file.name} (${uploadFile.parsedData?.length || 0} rows)`
                          : "Click to select CSV/Excel file or drag and drop"}
                      </span>
                      <span className="text-sm text-gray-500 mt-1">
                        CSV or Excel files (.csv, .xlsx, .xls)
                      </span>
                    </label>
                  </div>
                </div>

                {/* Upload Results */}
                {uploadResults && (
                  <div
                    className={`rounded-lg p-4 ${
                      uploadResults.success
                        ? "bg-green-50 border border-green-200"
                        : "bg-red-50 border border-red-200"
                    }`}
                  >
                    <h3 className="font-semibold mb-2">
                      {uploadResults.success
                        ? "Upload Results"
                        : "Upload Failed"}
                    </h3>
                    <div className="text-sm space-y-1">
                      <p>
                        <span className="font-medium">Created:</span>{" "}
                        {uploadResults.created || 0} location(s)
                      </p>
                      {uploadResults.errors > 0 && (
                        <p className="text-red-700">
                          <span className="font-medium">Errors:</span>{" "}
                          {uploadResults.errors} row(s)
                        </p>
                      )}
                    </div>
                    {uploadResults.details?.failed?.length > 0 && (
                      <div className="mt-3 max-h-40 overflow-y-auto">
                        <p className="font-medium text-sm mb-1">Failed Rows:</p>
                        <ul className="text-xs space-y-1">
                          {uploadResults.details.failed
                            .slice(0, 10)
                            .map((error, idx) => (
                              <li key={idx} className="text-red-700">
                                Row {error.row}: {error.error}
                              </li>
                            ))}
                          {uploadResults.details.failed.length > 10 && (
                            <li className="text-gray-500">
                              ... and {uploadResults.details.failed.length - 10}{" "}
                              more
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleCloseBulkUpload}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBulkUpload}
                    disabled={!uploadFile?.parsedData || uploading}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:shadow-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <FaUpload /> Upload
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Locations;
