import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../../ComponentsCss/GenerateSalaryComponent/SalaryStructure/SalaryStructure.css";
import { usePopup } from "../../../../context/popup-context/Popup";
import { Popup } from "../../../Utils/Popup/Popup";
import { GlobalContext } from "../../../../context/GlobalContext/GlobalContext";
import BulkCTCUpload from "./BulkCTCUpload";

export default function SalaryStructure() {
  const navigate = useNavigate();
  const { globalData } = useContext(GlobalContext);

  const [templates, setTemplates] = useState([]);
  const [employeeId, setEmployeeId] = useState("");
  const [ctc, setCtc] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [companyCode, setCompanyCode] = useState(
    globalData?.userInfo?.companyCode || "",
  );
  const [employee_id, setEmployee_id] = useState(
    globalData?.userInfo?.employee_id || "",
  );
  const [validFrom, setValidFrom] = useState("");
  const [validTo, setValidTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [breakup, setBreakup] = useState([]);
  const { showPopup, setShowPopup, setMessage } = usePopup();
  const [flatValues, setFlatValues] = useState({});
  const [finalBreakupArray, setFinalBreakupArray] = useState([]);
  const [showBulkComp, setShowBulkComp] = useState(false);
  console.log("globalData", globalData);
  // Fetch salary templates
  useEffect(() => {
    axios
      .get(
        `${process.env.REACT_APP_API_URL}/salary-template/get_all_salaryTemplates`,
      )
      .then((res) => setTemplates(res.data.data || []))
      .catch((err) => console.error("Failed to fetch templates", err));
  }, []);

  useEffect(() => {
    if (!selectedTemplate || !ctc || !employeeId) return;

    const delayDebounce = setTimeout(() => {
      fetchPreview();
    }, 1000);

    return () => clearTimeout(delayDebounce);
  }, [ctc, selectedTemplate, flatValues, employeeId]);

  const fetchPreview = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/ctc-structure/preview_ctc/${selectedTemplate}/${ctc}`,
        {
          params: {
            flatValues: JSON.stringify(flatValues),
            employee_id: employeeId,
          },
        },
      );
      setBreakup(response.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!breakup || breakup.length === 0) {
      setFinalBreakupArray([]);
      return;
    }

    const arr = breakup.map((c) => ({
      component: c.component || c.name || c.label || "",
      abbreviation: c.abbreviation || "",
      formula: (c.formula || "").toString().trim(),
      amount: Number(c.amount) || 0,
      is_flexible: !!c.is_flexible,
      pay_type: c.pay_type,
    }));

    setFinalBreakupArray(arr);
  }, [breakup]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!employeeId || !ctc || !selectedTemplate) {
      setShowPopup(true);
      setMessage("Please fill all required fields.");
      setTimeout(() => setShowPopup(false), 3000);
      return;
    }

    const payload = {
      employee_id: employeeId.trim(),
      companyCode: companyCode.toString().trim(),
      ctc: Number(ctc),
      salaryTemplateId: selectedTemplate,
      valid_from: validFrom,
      valid_to: validTo,
      flatValues: flatValues,
      componentBreakup: finalBreakupArray,
    };

    try {
      setLoading(true);
      await axios.post(
        `${process.env.REACT_APP_API_URL}/ctc-structure/single_user_ctc_structure`,
        payload,
      );

      setShowPopup(true);
      setMessage("✅ CTC structure created successfully.");
      setTimeout(() => setShowPopup(false), 3000);

      // Reset form
      setEmployeeId("");
      setCtc("");
      setSelectedTemplate("");
      setValidFrom("");
      setValidTo("");
      setBreakup([]);
      setFlatValues({});
    } catch (err) {
      console.error("Submit failed", err);
      setShowPopup(true);
      setMessage(
        `❌ Failed to create CTC structure. ${
          err.response?.data?.message || ""
        }`,
      );
      setTimeout(() => setShowPopup(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUpload = () => {
    setShowBulkComp(true);
  };

  // Render Bulk Upload Component instead if active
  if (showBulkComp) {
    return (
      <div className="ctc-container">
        <button
          onClick={() => setShowBulkComp(false)}
          className="global-btn backBtn"
          style={{ marginBottom: "15px" }}
        >
          ←
        </button>
        <BulkCTCUpload />
      </div>
    );
  }

  // Render Default Single Upload Component
  return (
    <>
      <div className="ctc-container">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2>Create CTC Structure</h2>
          <button onClick={handleBulkUpload} className="global-btn">
            Bulk Upload CTCs 🚀
          </button>
        </div>

        <form onSubmit={handleSubmit} className="ctc-form">
          <div className="ctc_main_inputs">
            <label>
              Company*:
              <input
                type="number"
                value={companyCode}
                onChange={(e) => setCompanyCode(e.target.value)}
              />
            </label>
            <label>
              Employee ID*:
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                required
              />
            </label>

            <label>
              CTC Amount Annual*:
              <input
                type="number"
                value={ctc}
                onChange={(e) => setCtc(e.target.value)}
                required
              />
            </label>

            <label>
              Select Salary Template*:
               <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                title={
                  selectedTemplate?.description ||
                  "Hover a template option to see its description"
                }
                required
              >
                <option
                  value=""
                  className="ctc-form-option"
                  title="Select a salary template"
                >
                  -- Select Template --
                </option>
                {templates.map((template) => (
                  <option
                    key={template._id}
                    value={template._id}
                    title={template.description || template.name}
                    className="ctc-form-option"
                  >
                    {template.name}
                  </option>
                ))}
              </select> 

            </label>
          </div>

          <div className="ctc_validity">
           {/* <label>
           <div className="ctc_validity">
            <label className="disablefeild">
              Valid From*:
              <input
                type="date"
                value={validFrom}
                onChange={(e) => setValidFrom(e.target.value)}
                disabled={true}
              />
            </label>
            <label className="disablefeild">
              Valid To:
              <input
                type="date"
                value={validTo}
                onChange={(e) => setValidTo(e.target.value)}
                disabled={true}
              />
            </label> */}

            <button type="submit_ctctbn" disabled={loading}>
              {loading ? "Submitting..." : "Create CTC"}
            </button>
          </div>
        </form>

        {breakup.length > 0 && (
          <div className="ctc-breakup-preview">
            <h3>Component Breakup Preview</h3>
            <table>
              <thead>
                <tr>
                  <th>Component</th>
                  <th>Abbreviation</th>
                  <th>Formula</th>
                  <th>Amount Monthly</th>
                </tr>
              </thead>
              <tbody>
                {breakup.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.component}</td>
                    <td>{item.abbreviation}</td>
                    <td>{item.formula || "Flat Amount"}</td>
                    {/* <td>
                      {item.formula === "Flat Amount" ? (
                        <input
                          type="number"
                          value={flatValues[item.abbreviation] || ""}
                          onChange={(e) =>
                            setFlatValues({
                              ...flatValues,
                              [item.abbreviation]: e.target.value,
                            })
                          }
                        />
                      ) : (
                        item.amount
                      )}
                    </td> */}
                    <td>
                      {item.formula === "Flat Amount" ? (
                        <input
                          type="number"
                          // ⭐ THE FIX: If flatValues is empty, display the template's default item.amount
                          value={
                            flatValues[item.abbreviation] !== undefined
                              ? flatValues[item.abbreviation]
                              : item.amount || ""
                          }
                          onChange={(e) => {
                            const value = e.target.value;

                            setFlatValues({
                              ...flatValues,
                              [item.abbreviation]:
                                value === "" ? undefined : Number(value),
                            });
                          }}
                        />
                      ) : (
                        item.amount
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {showPopup && <Popup />}
    </>
  );
}
