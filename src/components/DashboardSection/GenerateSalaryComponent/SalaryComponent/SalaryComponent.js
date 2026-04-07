// src/components/AdminPanel/SalaryComponents/SingleSalaryComponent.js
import React, { useState, useEffect } from "react";
// REMOVED: import axios from "axios"; // No API calls here
import "../../../ComponentsCss/GenerateSalaryComponent/SalaryComponent.css";
import { IoArrowBack } from "react-icons/io5";

import Button from "../../../../context/GlobalButton/globalButton";

// The component now accepts 'mode', 'initialData', 'onCancel', 'onSubmitData', 'isSubmitting'
function SingleSalaryComponent({
  mode,
  initialData,
  onCancel,
  onSubmitData,
  isSubmitting,
}) {
  const [formData, setFormData] = useState(
    initialData || {
      // Initialize with initialData or empty defaults
      name: "",
      abbreviation: "",
      effective_date: "",
      paid_component: false,
      pay_type: "",
      taxable: false,
      non_taxable: false,
      tax_is_distributed_acros_year: false,
      calculation_type: "",
      formula_description: "",
      jv_code: "",
      map_to: "",
      round_of_value: "",
      variable_component: false,
      fixed_component: false,
      attendance_dependent: false,
      fbp_component: false,
      part_of_ctc: false,
      part_of_gross: false,
      part_of_net: false,
      part_of_esi: false,
      part_of_pf: false,
      part_of_pt: false,
      create_dependent_component: false,
      active: false,
      ffs_component: false,
    },
  );
  const [isDisabled, setIsDisabled] = useState(false);

  const handleSave = () => {
    console.log("Saved");
  };
  // REMOVED: const [submissionStatus, setSubmissionStatus] = useState(null);
  // REMOVED: const [loading, setLoading] = useState(false);

  // Effect to update formData if initialData changes (e.g., when switching from view to edit)
  useEffect(() => {
    if (initialData) {
      // Format date for input type="date"
      const formattedDate = initialData.effective_date
        ? new Date(initialData.effective_date).toISOString().split("T")[0]
        : "";
      setFormData({
        ...initialData,
        effective_date: formattedDate,
      });
    } else {
      // Reset form for 'add' mode if initialData becomes null
      setFormData({
        // Reset to default empty values
        name: "",
        abbreviation: "",
        effective_date: "",
        paid_component: false,
        pay_type: "",
        taxable: false,
        non_taxable: false,
        tax_is_distributed_acros_year: false,
        calculation_type: "",
        formula_description: "",
        jv_code: "",
        map_to: "",
        round_of_value: "Nearest to 1 Rs",
        variable_component: false,
        fixed_component: false,
        attendance_dependent: false,
        fbp_component: false,
        part_of_ctc: false,
        part_of_gross: false,
        part_of_net: false,
        part_of_esi: false,
        part_of_pf: false,
        part_of_pt: false,
        create_dependent_component: false,
        active: false,
        ffs_component: false,
      });
    }
  }, [initialData]); // Rerun when initialData prop changes

  // const handleChange = (e) => {
  //   // Only allow changes if not in 'view' mode
  //   if (mode === "view") return;

  //   const { name, value, type, checked } = e.target;
  //   setFormData((prevData) => ({
  //     ...prevData,
  //     [name]: type === "checkbox" ? checked : value,
  //   }));
  // };
  const handleChange = (e) => {
    // Only allow changes if not in 'view' mode
    if (mode === "view") return;

    const { name, value, type, checked } = e.target;
    let newValue = type === "checkbox" ? checked : value;

    setFormData((prevData) => {
      let updatedData = { ...prevData, [name]: newValue };

      // ⭐ SMART UI LOGIC ⭐
      if (name === "part_of_ctc") {
        if (checked) {
          // If user selects Part of CTC, auto-select Part of Gross
          updatedData.part_of_gross = true;
        } else {
          // If they uncheck it, reset Gross so it doesn't get stuck
          updatedData.part_of_gross = false;
        }
      }

      return updatedData;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // No API calls here. Just pass the data up to the parent.
    // Parent will handle validation, API call, and success/error messages.
    if (onSubmitData) {
      onSubmitData(formData, mode); // Pass formData and current mode to parent
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel(); // Use the prop to go back to the list
    }
  };

  // Determine form title based on mode
  const formTitle =
    mode === "add"
      ? "Add New Salary Component"
      : mode === "edit"
        ? "Edit Salary Component"
        : "View Salary Component Details";

  // Determine button text based on mode
  const submitButtonText =
    mode === "add" ? "Add Salary Component" : "Update Salary Component";

  // Determine if inputs should be read-only (for 'view' mode)
  const isReadOnly = mode === "view";

  return (
    <div className="add-salary-component-form-container">
      <div className="newSalaryHeader">
        <button type="button" onClick={handleCancel} className="back-button">
          <IoArrowBack style={{ fontSize: 22 }} />
        </button>
        <h2 className="add_salary_header">{formTitle}</h2>
      </div>

      {/* Submission status display will now be in the parent, or passed down */}
      {/* If you still want to show messages from parent, pass submissionStatus as a prop */}
      {/* {submissionStatus && (
        <div className={`form-status ${submissionStatus.type}`}>
          {submissionStatus.message}
        </div>
      )} */}
      <div className="salary_form_section">
        <form onSubmit={handleSubmit}>
          {/* All your form inputs */}
          {/* Input fields conditionally readOnly/disabled based on isReadOnly */}
          {/* ... (rest of your form inputs, ensure readOnly/disabled attributes are applied) ... */}

          <div className="form-row1">
            <label>
              Name:
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required={!isReadOnly}
                readOnly={isReadOnly}
              />
            </label>
            <label>
              Abbreviation:
              <input
                type="text"
                name="abbreviation"
                value={formData.abbreviation}
                onChange={handleChange}
                required={!isReadOnly}
                readOnly={isReadOnly}
              />
            </label>
            <label>
              Effective Date:
              <input
                type="date"
                name="effective_date"
                value={formData.effective_date}
                onChange={handleChange}
                readOnly={isReadOnly}
              />
            </label>
          </div>

          <div className="form-row2">
            <div className="check1">
              <label>Paid Component:</label>
              <input
                type="checkbox"
                name="paid_component"
                checked={formData.paid_component}
                onChange={handleChange}
                disabled={isReadOnly}
              />
            </div>

            <label>
              Pay Type:
              <select
                name="pay_type"
                value={formData.pay_type}
                onChange={handleChange}
                disabled={isReadOnly}
              >
                <option value="">Select</option>
                <option value="Deduction">Deduction</option>
                <option value="Earning">Earning</option>
                {/* <option value="Reimbursement">Reimbursement</option> */}
                {/* <option value="Over Time">Over Time</option> */}
                <option value="Statutory Component">Statutory Component</option>
              </select>
            </label>
          </div>

          <div className="form-row">
            <div className="check1">
              <label>Taxable:</label>
              <input
                type="checkbox"
                name="taxable"
                checked={formData.taxable}
                onChange={handleChange}
                disabled={isReadOnly}
              />
            </div>

            <div className="check1">
              {" "}
              <label>Non-Taxable:</label>
              <input
                type="checkbox"
                name="non_taxable"
                checked={formData.non_taxable}
                onChange={handleChange}
                disabled={isReadOnly}
              />
            </div>

            <div className="check1">
              <label className="disablefeild">
                Tax Distributed Across Year:
              </label>
              <input
                type="checkbox"
                name="tax_is_distributed_acros_year"
                checked={formData.tax_is_distributed_acros_year}
                onChange={handleChange}
                // disabled={isReadOnly}
                disabled={true}
              />
            </div>
          </div>

          <div className="form-row3">
            <label>
              Calculation Type:
              <select
                name="calculation_type"
                value={formData.calculation_type}
                onChange={handleChange}
                required={!isReadOnly}
                disabled={isReadOnly}
              >
                <option value="">Select</option>
                <option value="Fixed">Fixed</option>
                <option value="Formula">Formula</option>
              </select>
            </label>
            {formData.calculation_type === "Formula" && (
              <label>
                Formula Description:
                <textarea
                  name="formula_description"
                  value={formData.formula_description}
                  onChange={handleChange}
                  rows="3"
                  readOnly={isReadOnly}
                />
              </label>
            )}
            {/* <label>
              JV Code:
              <input
                type="text"
                name="jv_code"
                value={formData.jv_code}
                onChange={handleChange}
                // readOnly={isReadOnly}
                disabled={true}
              />
            </label> */}
            <label className="disablefeild">
              Map To:
              <select
                name="map_to"
                value={formData.map_to}
                onChange={handleChange}
                // disabled={isReadOnly}
                disabled={true}
              >
                <option value="">Select</option>
                <option value="Earning">Earning</option>
                <option value="Deduction">Deduction</option>
              </select>
            </label>
            <label>
              Round Off Value:
              <select
                name="round_of_value"
                value={formData.round_of_value}
                onChange={handleChange}
                disabled={isReadOnly}
              >
                {/* <option value="">Select</option> */}
                <option value="Nearest to 1 Rs">Nearest to 1 Rs</option>
                <option value="Nearest to 50 Paise">Nearest to 50 Paise</option>
                <option value="Nearest to 5 Rs">Nearest to 5 Rs</option>
                <option value="Nearest to 10 Rs">Nearest to 10 Rs</option>
                <option value="None">None</option>
                <option value="Round Up">Round Up</option>
              </select>
            </label>
          </div>

          <div className="form-row"></div>

          <div className="form-section-title">Component Properties</div>
          <div className="form-row-checkboxes">
            <div className="check1">
              <label className="label-checkbox">Variable Component:</label>
              <input
                type="checkbox"
                name="variable_component"
                checked={formData.variable_component}
                onChange={handleChange}
                disabled={isReadOnly}
              />
            </div>
            <div className="check1">
              <label className="label-checkbox">Attendance Dependent:</label>
              <input
                type="checkbox"
                name="attendance_dependent"
                checked={formData.attendance_dependent}
                onChange={handleChange}
                disabled={isReadOnly}
              />
            </div>
            <div className="check1">
              <label className="label-checkbox disablefeild">
                FBP Component:
              </label>
              <input
                type="checkbox"
                name="fbp_component"
                checked={formData.fbp_component}
                onChange={handleChange}
                // disabled={isReadOnly}
                disabled={true}
              />
            </div>
            <div className="check1">
              <label className="label-checkbox">Part of CTC:</label>
              <input
                type="checkbox"
                name="part_of_ctc"
                checked={formData.part_of_ctc}
                onChange={handleChange}
                // disabled={isReadOnly}
                disabled={
                  isReadOnly ||
                  (formData.part_of_gross && !formData.part_of_ctc)
                }
              />
            </div>
          </div>
          <div className="form-row-checkboxes">
            <div className="check1">
              <label className="label-checkbox">Part of Gross:</label>
              <input
                type="checkbox"
                name="part_of_gross"
                checked={formData.part_of_gross}
                onChange={handleChange}
                // disabled={isReadOnly}
                disabled={isReadOnly || formData.part_of_ctc}
              />
            </div>

            <div className="check1">
              <label className="label-checkbox disablefeild">
                Part of Net:
              </label>
              <input
                type="checkbox"
                name="part_of_net"
                checked={formData.part_of_net}
                onChange={handleChange}
                // disabled={isReadOnly}
                disabled={true}
              />
            </div>

            <div className="check1">
              <label className="label-checkbox disablefeild">
                Part of ESI:
              </label>
              <input
                type="checkbox"
                name="part_of_esi"
                checked={formData.part_of_esi}
                onChange={handleChange}
                // disabled={isReadOnly}
                disabled={true}
              />
            </div>

            <div className="check1">
              <label className="label-checkbox disablefeild">Part of PF:</label>
              <input
                type="checkbox"
                name="part_of_pf"
                checked={formData.part_of_pf}
                onChange={handleChange}
                // disabled={isReadOnly}
                disabled={true}
              />
            </div>

            <div className="check1">
              <label className="label-checkbox disablefeild">Part of PT:</label>
              <input
                type="checkbox"
                name="part_of_pt"
                checked={formData.part_of_pt}
                onChange={handleChange}
                // disabled={isReadOnly}
                disabled={true}
              />
            </div>
          </div>
          <div className="form-row-checkboxes">
            <div className="check1">
              <label className="label-checkbox disablefeild">
                Create Dependent Component:
              </label>
              <input
                type="checkbox"
                name="create_dependent_component"
                checked={formData.create_dependent_component}
                onChange={handleChange}
                // disabled={isReadOnly}
                disabled={true}
              />
            </div>

            <div className="check1">
              <label className="label-checkbox disablefeild">Active:</label>
              <input
                type="checkbox"
                name="active"
                checked={formData.active}
                onChange={handleChange}
                // disabled={isReadOnly}
                disabled={true}
              />
            </div>

            <div className="check1">
              <label className="label-checkbox">FFS Component:</label>
              <input
                type="checkbox"
                name="ffs_component"
                checked={formData.ffs_component}
                onChange={handleChange}
                disabled={isReadOnly}
              />
            </div>
          </div>

          {/* Only show submit button if not in 'view' mode */}
          {mode !== "view" && (
            <div className="form-actions">
              {/* <button
                type="submit"
                className="submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : submitButtonText}
              </button> */}
              <Button
                text={isSubmitting ? "Processing..." : submitButtonText}
                type="submit"
                // className="submit-button"
                disabled={isSubmitting}
              ></Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default SingleSalaryComponent;
