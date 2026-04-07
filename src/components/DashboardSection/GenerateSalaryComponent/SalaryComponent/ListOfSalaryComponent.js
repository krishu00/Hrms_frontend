// src/components/AdminPanel/SalaryComponents/ListOfSalaryComponent.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../../ComponentsCss/GenerateSalaryComponent/SalaryComponent.css";
import { MdAddComment } from "react-icons/md";
import SingleSalaryComponent from "./SalaryComponent"; // Import the form component
import { usePopup } from "../../../../context/popup-context/Popup";
import { Popup } from "../../../Utils/Popup/Popup";

function ListOfSalaryComponent() {
  const [salaryComponents, setSalaryComponents] = useState([]);
  const [loading, setLoading] = useState(true); // For fetching list data
  const [error, setError] = useState(null); // For fetching list data errors
  const { showPopup, setShowPopup, setMessage } = usePopup();

  const [currentMode, setCurrentMode] = useState("list"); // 'list', 'add', 'edit', 'view'
  const [selectedComponent, setSelectedComponent] = useState(null); // Data for edit/view
  const [componentToDelete, setComponentToDelete] = useState(null);

  const [formSubmissionLoading, setFormSubmissionLoading] = useState(false); // For API calls from the form
  const [formSubmissionError, setFormSubmissionError] = useState(null); // For API errors from the form

  const fetchSalaryComponents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/salary-component/get_all`
      );
      setSalaryComponents(response.data.data || []);
    } catch (err) {
      console.error("Error fetching salary components:", err);
    } finally {
      setLoading(false);
    }
  };

  // Effect hook to fetch data when the component mounts or mode changes to 'list'
  useEffect(() => {
    if (currentMode === "list") {
      fetchSalaryComponents();
    }
  }, [currentMode]); // Re-run effect when currentMode changes to 'list'

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-CA");
  };

  // Handlers to change the mode and set selected data
  const handleAddClick = () => {
    setCurrentMode("add");
    setSelectedComponent(null); // Clear any previously selected data for new entry
    setFormSubmissionError(null); // Clear form specific errors
  };

  const handleView = (component) => {
    setCurrentMode("view");
    setSelectedComponent(component);
    setFormSubmissionError(null); // Clear form specific errors
  };

  const handleEdit = (component) => {
    setCurrentMode("edit");
    setSelectedComponent(component);
    setFormSubmissionError(null); // Clear form specific errors
  };

  const handleDelete = async () => {
    if (!componentToDelete) return;

    setLoading(true);
    setError(null);
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/salary-component/delete/${componentToDelete._id}`
      );
      setShowPopup(true);
      setMessage(`${componentToDelete.name} deleted successfully!`);
      setTimeout(() => setShowPopup(false), 3000);
      setComponentToDelete(null);
      await fetchSalaryComponents();
      setCurrentMode("list");
    } catch (err) {
      setShowPopup(true);
      setMessage("Failed to delete salary component. Please try again.");
      console.error("Error deleting salary component:", err);
      setTimeout(() => setShowPopup(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  // NEW: Handler for form submission coming from SingleSalaryComponent
  const handleFormSubmission = async (formData, mode) => {
    setFormSubmissionLoading(true); // Start loading for form submission
    setFormSubmissionError(null); // Clear previous form errors

    try {
      if (
        !formData.name ||
        !formData.abbreviation ||
        !formData.calculation_type
      ) {
        setFormSubmissionError(
          "Name, Abbreviation, and Calculation Type are required."
        );
        return;
      }

      let response;
      if (mode === "add") {
        response = await axios.post(
          `${process.env.REACT_APP_API_URL}/salary-component/add_salary_component`,
          formData
        );
        setShowPopup(true);
        setMessage("Salary component added successfully!");
        setTimeout(() => setShowPopup(false), 3000);
      } else if (mode === "edit") {
        response = await axios.put(
          `${process.env.REACT_APP_API_URL}/salary-component/update/${formData._id}`, // Use _id from formData
          formData
        );
        // alert("Salary component updated successfully!"); // Alert for success
        setShowPopup(true);
        setMessage("Salary component updated successfully!");
        setTimeout(() => setShowPopup(false), 3000);
      }
      console.log(`${mode} successful:`, response.data);

      // Successfully added/updated, now return to list view and trigger re-fetch
      await fetchSalaryComponents();
      setCurrentMode("list");
      setSelectedComponent(null); // Clear selected component
    } catch (error) {
      console.error(
        `Error ${mode}ing salary component:`,
        error.response ? error.response.data : error.message
      );
      setFormSubmissionError(
        error.response?.data?.message || `Failed to ${mode} salary component.`
      );
    } finally {
      setFormSubmissionLoading(false); // End loading for form submission
    }
  };

  // Callback from SingleSalaryComponent to return to list view (on cancel)
  const handleReturnToList = () => {
    setCurrentMode("list");
    setSelectedComponent(null); // Clear selected component
    setFormSubmissionError(null); // Clear form specific errors on cancel
  };

  // --- Conditional Rendering Logic ---
  if (
    currentMode === "add" ||
    currentMode === "edit" ||
    currentMode === "view"
  ) {
    return (
      <div className="form-display-area">
        {formSubmissionError && ( // Display form submission error if any
          <div className="form-status error">{formSubmissionError}</div>
        )}
        <SingleSalaryComponent
          mode={currentMode}
          initialData={selectedComponent}
          onCancel={handleReturnToList}
          onSubmitData={handleFormSubmission} // Pass the new handler
          isSubmitting={formSubmissionLoading} // Pass loading state to disable form
        />
      </div>
    );
  }

  // Render the list view if currentMode is 'list'
  if (loading) {
    return <div className="loading-message">Loading salary components...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    // <div className="salary-component-list-container">
    //   <div className="add-button-container">
    //     <h3 className="list_salary_header">List of Salary Components</h3>
    //     <button
    //       className="add-button"
    //       title="Add New Salary Com."
    //       onClick={handleAddClick}
    //     >
    //       <MdAddComment style={{ fontSize: "26px" }} />
    //     </button>
    //   </div>
    //   {salaryComponents.length === 0 ? (
    //     <p className="no-data-message">No salary components found.</p>
    //   ) : (
    //     <table className="salary-component-table">
    //       <thead>
    //         <tr>
    //           <th>Name</th>
    //           <th>Abbreviation</th>
    //           <th>Pay Type</th>
    //           <th>Calculation Type</th>
    //           <th>Effective Date</th>
    //           <th>Taxable</th>
    //           <th>Active</th>
    //           <th>Actions</th>
    //         </tr>
    //       </thead>
    //       <tbody>
    //         {salaryComponents.map((component) => (
    //           <tr key={component._id}>
    //             <td>{component.name}</td>
    //             <td>{component.abbreviation}</td>
    //             <td>{component.pay_type}</td>
    //             <td>{component.calculation_type}</td>
    //             <td>{formatDate(component.effective_date)}</td>
    //             <td>{component.taxable ? "Yes" : "No"}</td>
    //             <td>{component.active ? "Yes" : "No"}</td>
    //             <td className="action-buttons">
    //               <button onClick={() => handleView(component)}>View</button>
    //               <button onClick={() => handleEdit(component)}>Edit</button>
    //               <button
    //                 onClick={() => handleDelete(component._id, component.name)}
    //               >
    //                 Delete
    //               </button>
    //             </td>
    //           </tr>
    //         ))}
    //       </tbody>
    //     </table>
    //   )}
    // </div>
    <>
      <div className="salary-component-list-container">
        <div className="add-button-container">
          <h3 className="list_salary_header">List of Salary Components</h3>
          <button
            className="add-button"
            title="Add New Salary Com."
            onClick={handleAddClick}
          >
            <MdAddComment style={{ fontSize: "26px" }} />
          </button>
        </div>

        {salaryComponents.length === 0 ? (
          <p className="no-data-message">No salary components found.</p>
        ) : (
          <div className="salary-component-table-wrapper">
            <table className="salary-component-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Abbreviation</th>
                  <th>Pay Type</th>
                  <th>Calculation Type</th>
                  <th>Effective Date</th>
                  <th>Taxable</th>
                  <th>Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {salaryComponents.map((component) => (
                  <tr key={component._id}>
                    <td>{component.name}</td>
                    <td>{component.abbreviation}</td>
                    <td>{component.pay_type}</td>
                    <td>{component.calculation_type}</td>
                    <td>{formatDate(component.effective_date)}</td>
                    <td>{component.taxable ? "Yes" : "No"}</td>
                    <td>{component.active ? "Yes" : "No"}</td>
                    <td className="action-buttons">
                      <button onClick={() => handleView(component)}>
                        View
                      </button>
                      <button onClick={() => handleEdit(component)}>
                        Edit
                      </button>
                      <button onClick={() => setComponentToDelete(component)}>
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
      {componentToDelete && (
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
            <h4 style={{  color:"#0d7c66",margin: "0 0 12px" }}>Delete Salary Component</h4>
            <p style={{ margin: "0 0 20px" }}>
              Are you sure you want to delete "{componentToDelete.name}"?
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",

              }}
            >
              <button type="button"  onClick={() => setComponentToDelete(null)}>
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

export default ListOfSalaryComponent;
