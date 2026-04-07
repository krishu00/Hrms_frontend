import React, { useState, useEffect } from "react";
import axios from "axios";
import { MdAddComment } from "react-icons/md";
import LeaveTemplateForm from "./LeaveTemplateForm.js";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { usePopup } from "../../../context/popup-context/Popup";
import { Popup } from "../../Utils/Popup/Popup";

export default function LeaveTemplate() {
  const [leaveTemplates, setLeaveTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentMode, setCurrentMode] = useState("list");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  const { showPopup, setShowPopup, setMessage } = usePopup();

  useEffect(() => {
    if (currentMode === "list") {
      const fetchTemplates = async () => {
        setLoading(true);
        setError("");
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/leave_template/get_all_leave_templates`
          );
          setLeaveTemplates(response.data.data || []);
        } catch (err) {
          console.error("Error fetching leave templates:", err);
          setError("Failed to load leave templates.");
          setMessage("Failed to load leave templates.");
          setShowPopup(true);
          setTimeout(() => setShowPopup(false), 3000);
        } finally {
          setLoading(false);
        }
      };
      fetchTemplates();
    }
  }, [currentMode, refreshKey]);

  const handleAddClick = () => {
    setSelectedTemplate(null);
    setCurrentMode("add");
  };

  const handleView = (template) => {
    setSelectedTemplate(template);
    setCurrentMode("view");
  };

  const handleEdit = (template) => {
    setSelectedTemplate(template);
    setCurrentMode("edit");
  };

  const handleDelete = async (templateId, name) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete "${name}"?`);
    if (!confirmDelete) return;

    try {
      const res = await axios.delete(
        `${process.env.REACT_APP_API_URL}/leave_template/delete/${templateId}`
      );

      if (res.data?.success) {
        setMessage(`"${name}" deleted successfully.`);
        setRefreshKey((prev) => prev + 1);
      } else {
        setMessage(`Failed to delete "${name}".`);
      }

      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 3000);
      setCurrentMode("list");
    } catch (err) {
      console.error("Delete failed:", err);
      setMessage("Server error while deleting.");
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 3000);
    }
  };

  const handleReturnToList = () => {
    setSelectedTemplate(null);
    setCurrentMode("list");
  };

  const handleFormSubmit = () => {
    setSelectedTemplate(null);
    setCurrentMode("list");
    setMessage("Template saved successfully.");
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 3000);
    setRefreshKey((prev) => prev + 1);
  };

  if (["add", "edit", "view"].includes(currentMode)) {
    return (
      <div className="form-display-area">
        <LeaveTemplateForm
          mode={currentMode}
          initialData={selectedTemplate}
          onCancel={handleReturnToList}
          onSubmitData={handleFormSubmit}
        />
        {showPopup && <Popup />}
      </div>
    );
  }

  return (
    <div className="leave-template-list-container">
      <div className="add-button-container">
        <h3 className="temp_back_btn_container">
          <div className="leave-template-header">
            <button
              className="leave-template-back-btn"
              onClick={() => navigate(-1)}
            >
              <IoArrowBack size={20} />
            </button>
          </div>
          List of Leave Templates
        </h3>
        <button
          className="add-button"
          title="Add New Leave Template"
          onClick={handleAddClick}
        >
          <MdAddComment style={{ fontSize: "26px" }} />
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : leaveTemplates.length === 0 ? (
        <p>No leave templates found.</p>
      ) : (
        <table className="leave-template-table">
          <thead>
            <tr>
              <th className="leave-col">Name</th>
              <th className="leave-col">Description</th>
              <th className="leave-col">Leaves</th>
              <th className="leave-action-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leaveTemplates.map((template) => (
              <tr key={template._id}>
                <td>{template.name}</td>
                <td>{template.description}</td>
                <td>
                  {template.leaves
                    ?.map((c) => c.abbreviation)
                    .filter(Boolean)
                    .join(", ") || "-"}
                </td>
                <td className="leave-actions">
                  <button onClick={() => handleView(template)}>View</button>
                  <button onClick={() => handleEdit(template)}>Edit</button>
                  <button
                    onClick={() => handleDelete(template._id, template.name)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {showPopup && <Popup />}
    </div>
  );
}
