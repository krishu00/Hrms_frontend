import React, { useState } from "react";
import axios from "axios";
import { usePopup } from "../../../context/popup-context/Popup";
import { Popup } from "../../Utils/Popup/Popup";

const CreateMultiUsers = () => {
  const [selectedOption, setSelectedOption] = useState("");
  const [companyCode, setCompanyCode] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { showPopup, setShowPopup, setMessage } = usePopup();

  // Handle dropdown selection change
  const handleOptionChange = (e) => {
    setSelectedOption(e.target.value);
    setError(""); // Clear error on option change
  };

  // Handle company code input change
  const handleCompanyCodeChange = (e) => setCompanyCode(e.target.value);

  // Handle file input change
  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  // Download All Users by Company
  const handleSubmit = async () => {
    if (!companyCode) {
      setShowPopup(true);
      setMessage("Please enter a company code.");
      setTimeout(() => setShowPopup(false), 3000);
      // alert("Please enter a company code.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}download-excel/${companyCode}`,
        {
          headers: { "Content-Type": "application/json" },
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `Users_${companyCode}.xlsx`;
      link.click();

      console.log("Excel file downloaded successfully.");
    } catch (err) {
      console.error("Error downloading Excel:", err);
      setError("Failed to download the Excel file.");
    } finally {
      setLoading(false);
    }
  };

  // Download Sample Excel Template
  const downloadExcelTemplate = async () => {
    setError("");
    setLoading(true);

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}excel-template?companyCode=${companyCode}`,
        {
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data]);
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.setAttribute("download", "excelTemplate.xlsx");
      link.click();

      console.log("Template downloaded successfully.");
    } catch (err) {
      console.error("Error downloading template:", err);
      setError("Error downloading the template.");
    } finally {
      setLoading(false);
    }
  };

  const uploadBulkUsers = async () => {
    if (!file || !companyCode) {
      setShowPopup(true);
      setMessage("Please select a file and enter the company code.");
      setTimeout(() => setShowPopup(false), 3000);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("companyCode", companyCode);

    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}upload-bulk/${companyCode}`,
        formData,
        { responseType: "blob" } // Handles both JSON and Excel file
      );

      const contentType = response.headers["content-type"] || "";

      if (contentType.includes("application/json")) {
        // If response is JSON (success case), parse and show message
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const json = JSON.parse(reader.result);
            if (json.message === "Bulk upload successful") {
              setShowPopup(true);
              setMessage(
                `✅ Bulk upload successful!\nTotal Users Inserted: ${
                  json.totalUsersInserted || 0
                }`
              );
            } else {
              setError("Unexpected JSON response from the server.");
            }
          } catch (err) {
            setError("Failed to parse JSON response from server.");
          } finally {
            setTimeout(() => setShowPopup(false), 3000);
          }
        };
        reader.readAsText(response.data);
      } else if (
        contentType.includes(
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
      ) {
        // If response is an Excel file (skipped rows), download it
        const blob = new Blob([response.data], { type: contentType });
        const contentDisposition = response.headers["content-disposition"];
        const fileName = contentDisposition
          ? contentDisposition.split("filename=")[1]?.replace(/"/g, "")
          : "skipped_users.xlsx";

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        link.click();

        setShowPopup(true);
        setMessage("⚠️ Some users were skipped. Skipped file downloaded.");
        setTimeout(() => setShowPopup(false), 3000);
      } else {
        setError("Unknown response format from the server.");
        setTimeout(() => setShowPopup(false), 3000);
      }
    } catch (err) {
      console.error("Error uploading bulk users:", err);

      const blob = err?.response?.data;

      if (blob instanceof Blob) {
        const reader = new FileReader();

        reader.onloadend = () => {
          try {
            const text = reader.result;
            const json = JSON.parse(text);
            const errorMsg =
              json.message ||
              json.error ||
              "Unknown error occurred while uploading.";
            setShowPopup(true);
            setMessage(`❌ ${errorMsg}`);
          } catch {
            setShowPopup(true);
            setMessage("Upload failed. Could not parse server response.");
          } finally {
            setTimeout(() => setShowPopup(false), 3000);
          }
        };

        reader.onerror = () => {
          setShowPopup(true);
          setMessage("An error occurred while reading the server response.");
          setTimeout(() => setShowPopup(false), 3000);
        };

        reader.readAsText(blob);
      } else {
        const fallbackMsg =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err.message ||
          "Something went wrong during upload.";

        setShowPopup(true);
        setMessage(`❌ ${fallbackMsg}`);
        setTimeout(() => setShowPopup(false), 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Dropdown to select an action */}
      <select
        onChange={handleOptionChange}
        value={selectedOption}
        disabled={loading}
      >
        <option value="">Select an option</option>
        <option value="companyUsers">All Users By Company</option>
        <option value="sampleTemplate">Download Sample Template</option>
        <option value="bulkUpload">Upload Bulk Users</option>
      </select>

      {/* All Users By Company */}
      {selectedOption === "companyUsers" && (
        <div>
          <label>Enter Company Code:</label>
          <input
            type="text"
            placeholder="Enter company code"
            value={companyCode}
            onChange={handleCompanyCodeChange}
            disabled={loading}
          />
          <button onClick={handleSubmit} disabled={loading}>
            Submit
          </button>
        </div>
      )}

      {/* Download Sample Template */}
      {selectedOption === "sampleTemplate" && (
        <div>
          <button onClick={downloadExcelTemplate} disabled={loading}>
            Download Sample Excel Template
          </button>
        </div>
      )}

      {/* Upload Bulk Users */}
      {selectedOption === "bulkUpload" && (
        <div>
          <label>Enter Company Code:</label>
          <input
            type="text"
            placeholder="Enter company code"
            value={companyCode}
            onChange={handleCompanyCodeChange}
            disabled={loading}
          />
          <div>
            <input
              type="file"
              onChange={handleFileChange}
              disabled={loading}
              name="file"
            />
          </div>
          <button
            onClick={uploadBulkUsers}
            disabled={loading || !companyCode || !file}
          >
            Upload Bulk Users
          </button>
        </div>
      )}
      {showPopup && <Popup />}
    </div>
  );
};

export default CreateMultiUsers;
