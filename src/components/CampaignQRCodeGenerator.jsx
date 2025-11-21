import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import { FaTimes, FaDownload, FaCopy } from "react-icons/fa";
import { toast } from "react-toastify";

const CampaignQRCodeGenerator = ({ campaignId, campaignName, onClose }) => {
  const [qrCodeDataURL, setQrCodeDataURL] = useState("");
  const [isGenerating, setIsGenerating] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    generateQRCode();
  }, [campaignId]);

  const generateQRCode = async () => {
    try {
      setIsGenerating(true);
      setError("");

      // Get frontend URL from environment or use default
      // This should point to your consumer-facing frontend app
      const frontendUrl =
        process.env.VITE_SPINNER_API_URL || "http://localhost:3000";

      // Create the URL that will be encoded in the QR code
      // This will redirect to the frontend campaign page
      const campaignUrl = `${frontendUrl}/${campaignId}`;

      // Generate QR code as data URL
      const qrDataURL = await QRCode.toDataURL(campaignUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
        errorCorrectionLevel: "M",
      });

      setQrCodeDataURL(qrDataURL);
    } catch (err) {
      console.error("Error generating QR code:", err);
      setError("Failed to generate QR code");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQRCode = () => {
    if (qrCodeDataURL) {
      const link = document.createElement("a");
      link.download = `qr-code-${campaignName
        .replace(/\s+/g, "-")
        .toLowerCase()}.png`;
      link.href = qrCodeDataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("QR code downloaded successfully");
    }
  };

  const copyQRUrl = () => {
    const frontendUrl =
      process.env.VITE_SPINNER_API_URL || "http://localhost:3000";
    const campaignUrl = `${frontendUrl}/${campaignId}`;
    navigator.clipboard.writeText(campaignUrl);
    toast.success("URL copied to clipboard");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            QR Code for {campaignName}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {isGenerating ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-green-200 border-t-[#1ea25cff] rounded-full animate-spin"></div>
            <span className="ml-3 text-gray-600">Generating QR Code...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-red-600 text-lg font-medium mb-2">Error</div>
            <div className="text-gray-600 mb-4">{error}</div>
            <button
              onClick={generateQRCode}
              className="px-6 py-2 bg-[#1ea25cff] text-white rounded-lg hover:bg-[#1ea25cff]/90 transition"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
                <img
                  src={qrCodeDataURL}
                  alt={`QR Code for ${campaignName}`}
                  className="w-48 h-48"
                />
              </div>
            </div>

            <div className="text-center text-sm text-gray-600">
              <p className="mb-2">
                Scan this QR code to access the consumer microsite
              </p>
              <p className="text-xs text-gray-500">Campaign ID: {campaignId}</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={downloadQRCode}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
              >
                <FaDownload className="w-4 h-4" />
                Download PNG
              </button>
              <button
                onClick={copyQRUrl}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                <FaCopy className="w-4 h-4" />
                Copy URL
              </button>
            </div>

            <div className="text-xs text-gray-500 text-center">
              <p>
                QR Code will redirect to:{" "}
                {process.env.VITE_SPINNER_API_URL || "http://localhost:3000"}/
                {campaignId}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignQRCodeGenerator;
