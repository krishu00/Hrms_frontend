import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { MdAddComment } from "react-icons/md";
import SalaryTempalte from "./SalaryTemplate"; // Your form component
import { usePopup } from "../../../../context/popup-context/Popup";
import { Popup } from "../../../Utils/Popup/Popup";

export default function ListaOfSalaryTempalte() {
  const [salaryTemplates, setSalaryTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { showPopup, setShowPopup, setMessage } = usePopup();

  // 'list', 'add', 'edit', 'view'
  const [currentMode, setCurrentMode] = useState("list");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateToDelete, setTemplateToDelete] = useState(null);
  const skipNextFetchRef = useRef(false);

  const fetchSalaryTemplates = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/salary-template/get_all_salaryTemplates`
      );
      setSalaryTemplates(response.data.data || []);
    } catch (err) {
      console.error("Error fetching salary templates:", err);
      setError("Failed to load salary templates.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch salary templates whenever we return to list view
  useEffect(() => {
    if (currentMode === "list") {
      if (skipNextFetchRef.current) {
        skipNextFetchRef.current = false;
        return;
      }
      fetchSalaryTemplates();
    }
  }, [currentMode]);

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

  const handleDelete = async () => {
    if (!templateToDelete) return;

    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/salary-template/delete/${templateToDelete._id}`
      );
      setShowPopup(true);
      setMessage(`${templateToDelete.name} deleted successfully.`);
      setTimeout(() => setShowPopup(false), 3000);
      setTemplateToDelete(null);
      await fetchSalaryTemplates();
      setCurrentMode("list");
    } catch (err) {
      setShowPopup(true);
      setMessage("Delete failed");
      setTimeout(() => setShowPopup(false), 3000);
      console.error("Delete failed:", err);
    }
  };

  const handleReturnToList = () => {
    setSelectedTemplate(null);
    setCurrentMode("list");
  };

  const handleFormSubmit = async (savedTemplate) => {
    if (savedTemplate?._id) {
      skipNextFetchRef.current = true;
      setSalaryTemplates((prev) => {
        const existingIndex = prev.findIndex(
          (template) => template._id === savedTemplate._id
        );

        if (existingIndex === -1) {
          return [savedTemplate, ...prev];
        }

        const updatedTemplates = [...prev];
        updatedTemplates[existingIndex] = savedTemplate;
        return updatedTemplates;
      });
    } else {
      await fetchSalaryTemplates();
    }
    setSelectedTemplate(null);
    setCurrentMode("list");
  };

  // --------------------------------------------------------
  // OPTIMIZED: Conditional Rendering inside the same component
  // --------------------------------------------------------
  if (["add", "edit", "view"].includes(currentMode)) {
    return (
      <div className="form-display-area">
        <SalaryTempalte
          mode={currentMode}
          initialData={selectedTemplate}
          onCancel={handleReturnToList}
          onSubmitData={handleFormSubmit}
        />
      </div>
    );
  }

  // --------------------------------------------------------
  // List View UI
  // --------------------------------------------------------
  return (
    <>
      <div className="salary-component-list-container">
        <div className="add-button-container">
          <h3 className="list_salary_header">List of Salary Templates</h3>
          <button
            className="add-button"
            title="Add New Salary Template"
            onClick={handleAddClick}
          >
            <MdAddComment style={{ fontSize: "26px" }} />
          </button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : salaryTemplates.length === 0 ? (
          <p>No salary templates found.</p>
        ) : (
          <div className="salary-component-table-wrapper">
          <table className="salary-component-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Component</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {salaryTemplates.map((template) => (
                <tr key={template._id}>
                  <td>{template.name}</td>
                  <td>{template.description}</td>
                  <td>
                    {template.components
                      ?.map((c) => c.name)
                      .filter(Boolean)
                      .join(", ") || "-"}
                  </td>
                  <td className="action-buttons">
                    <button onClick={() => handleView(template)}>View</button>
                    <button onClick={() => handleEdit(template)}>Edit</button>
                    <button onClick={() => setTemplateToDelete(template)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
      {templateToDelete && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "12px",
              padding: "24px",
              width: "90%",
              maxWidth: "420px",
              boxShadow: "0 12px 30px rgba(0, 0, 0, 0.18)",
            }}
          >
            <h4 style={{ color:"#0d7c66",margin: "0 0 12px" }}>Delete Template</h4>
            <p style={{ margin: "0 0 20px" }}>
              Are you sure you want to delete "{templateToDelete.name}"?
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
                
              }}
            >
              <button type="button"  onClick={() => setTemplateToDelete(null)}>
                Cancel
              </button>
              <button type="button" style={{color:"red"}} onClick={handleDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {showPopup && <Popup />}
    </>
  );
}
