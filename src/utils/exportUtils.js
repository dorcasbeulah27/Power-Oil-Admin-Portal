import ExcelJS from "exceljs";

/**
 * Export data to Excel format with formatted headers and column widths
 * @param {Array} data - Array of objects to export
 * @param {Array} headers - Array of header objects with { key, label }
 * @param {String} filename - Name of the file (without extension)
 */
export const exportToCSV = async (data, headers, filename) => {
  if (!data || data.length === 0) {
    alert("No data to export");
    return;
  }

  try {
    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Report");

    // Add header row with styling
    const headerRow = worksheet.addRow(headers.map((h) => h.label));
    
    // Style header row: bold, black text, yellow background, centered
    headerRow.font = { bold: true, color: { argb: "FF000000" } };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFFEB3B" }, // Yellow color
    };
    headerRow.alignment = { horizontal: "center", vertical: "middle" };
    headerRow.height = 25;

    // Style each header cell individually
    headerRow.eachCell((cell, colNumber) => {
      cell.font = { bold: true, color: { argb: "FF000000" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFFEB3B" }, // Yellow color
      };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = {
        top: { style: "thin", color: { argb: "FF000000" } },
        left: { style: "thin", color: { argb: "FF000000" } },
        bottom: { style: "thin", color: { argb: "FF000000" } },
        right: { style: "thin", color: { argb: "FF000000" } },
      };
    });

    // Add data rows
    data.forEach((row) => {
      const dataRow = worksheet.addRow(
        headers.map((header) => {
          const value = row[header.key];
          return value === null || value === undefined ? "" : value;
        })
      );

      // Add borders to data cells
      dataRow.eachCell((cell) => {
        cell.border = {
          top: { style: "thin", color: { argb: "FFCCCCCC" } },
          left: { style: "thin", color: { argb: "FFCCCCCC" } },
          bottom: { style: "thin", color: { argb: "FFCCCCCC" } },
          right: { style: "thin", color: { argb: "FFCCCCCC" } },
        };
        cell.alignment = { vertical: "middle" };
      });
    });

    // Set column widths (auto-size based on content, with minimum width)
    headers.forEach((header, index) => {
      const column = worksheet.getColumn(index + 1);
      
      // Calculate max width based on header and data
      let maxLength = header.label.length;
      
      // Check data in this column
      data.forEach((row) => {
        const value = row[header.key];
        if (value !== null && value !== undefined) {
          const cellLength = String(value).length;
          if (cellLength > maxLength) {
            maxLength = cellLength;
          }
        }
      });
      
      // Set width with padding (minimum 15, maximum 60)
      column.width = Math.min(Math.max(maxLength + 5, 15), 60);
    });

    // Freeze header row
    worksheet.views = [
      {
        state: "frozen",
        ySplit: 1,
      },
    ];

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split("T")[0];
    const fullFilename = `${filename}-${timestamp}.xlsx`;

    // Write file and trigger download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    // Create download link
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", fullFilename);
    link.style.visibility = "hidden";

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error exporting to Excel:", error);
    alert("Failed to export file. Please try again.");
  }
};

