import React, { useState, useEffect } from "react";
import { IoArrowBack } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import axios from "axios";
import "../../ComponentsCss/DefineLeaveTemplate/leaveTemplate.css";
import { usePopup } from "../../../context/popup-context/Popup";
import { Popup } from "../../Utils/Popup/Popup";

export default function LeaveTemplateForm({
  mode = "add",
  initialData = {},
  onCancel,
  onSubmitData,
}) {
  const [allLeaves, setAllLeaves] = useState([]);
  const [templateLeaves, setTemplateLeaves] = useState([]);
  const [templateName, setTemplateName] = useState("");
  const [description, setDescription] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");
  const { showPopup, setShowPopup, setMessage } = usePopup();

  const isView = mode === "view";

  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/leaves/get-leaves`
        );
        if (response.data?.success && response.data.leaves) {
          setAllLeaves(response.data.leaves);
        }
      } catch (error) {
        console.error("Error fetching leaves:", error);
      }
    };

    fetchLeaves();

    if (initialData) {
      setTemplateName(initialData.name || "");
      setDescription(initialData.description || "");
      setEffectiveDate(initialData.effective_date?.split("T")[0] || "");

      if (mode === "view") {
        setTemplateLeaves(
          initialData.leaves.map((item) => ({
            _id: item.leave || item._id,
            leave_name: item.title || item.leave_name || " ",
            abbreviation: item.abbreviation || " ",
          }))
        );
      } else {
        const formattedLeaves = (initialData.leaves || []).map((item) => ({
          _id: typeof item.leave === "object" ? item.leave._id : item.leave,
          leave_name: item.name || item.leave_name || "",
          abbreviation: item.abbreviation || "",
          order: item.order ?? 0,
        }));
        setTemplateLeaves(formattedLeaves);
      }
    }
  }, [initialData]);

  const handleAddLeave = (leave) => {
    if (isView) return;
    const alreadyAdded = templateLeaves.some((l) => l._id === leave._id);
    if (alreadyAdded) {
      setMessage("Leave already added to template");
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 3000);
      return;
    }
    setTemplateLeaves((prev) => [...prev, leave]);
  };

  const handleRemoveLeave = (leaveId) => {
    if (isView) return;
    setTemplateLeaves((prev) => prev.filter((l) => l._id !== leaveId));
  };

  const handleSubmit = async () => {
    const payload = {
      name: templateName,
      description,
      effective_date: effectiveDate,
      leaves: templateLeaves.map((leave, index) => ({
        leave: leave._id,
        order: index + 1,
        title: leave.leave_name,
        abbreviation: leave.abbreviation,
        leave_credit_frequency: leave.leave_credit_frequency,
      })),
    };

    try {
      if (mode === "edit" && initialData._id) {
        await axios.put(
          `${process.env.REACT_APP_API_URL}/leave_template/edit/${initialData._id}`,
          payload,
          {
            headers: {
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
              Expires: "0",
            },
          }
        );
        setMessage("Leave template updated successfully!");
        setShowPopup(true);
        setTimeout(() => {
          setShowPopup(false);
          onSubmitData();
        }, 3000);
      } else {
        await axios.post(
          `${process.env.REACT_APP_API_URL}/leave_template/add_leave_template`,
          payload,
          {
            headers: {
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
              Expires: "0",
            },
          }
        );
        setMessage("Leave template created successfully!");
        setShowPopup(true);
        setTimeout(() => {
          setShowPopup(false);
          onSubmitData();
        }, 3000);
      }
    } catch (error) {
      console.error("Error submitting leave template:", error);
      setMessage("Error submitting template.");
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 3000);
    }
  };

  return (
    <div className="leave_temp_outer">
      <div className="leave_back_btn_container">
        <button type="button" onClick={onCancel} className="back_btn_leave">
          <IoArrowBack style={{ fontSize: 22 }} />
        </button>
        <div className="leave_create_head">
          <h3>
            {isView ? "View" : mode === "edit" ? "Edit" : "Create"} Leave Template
          </h3>
        </div>
      </div>

      <div className="leave_template_name">
        <label>
          <strong>Template Name:</strong>
          <input
            type="text"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="Enter template name"
            disabled={isView}
          />
        </label>
        <label>
          <strong>Description:</strong>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter description"
            disabled={isView}
          />
        </label>
      </div>

      <div className="leave_comp_outer">
        <div className="leave_comp_table">
          <table>
            <thead>
              <tr>
                <th>All Leave Types</th>
              </tr>
            </thead>
            <tbody>
              {allLeaves.map((leave) => (
                <tr key={leave._id}>
                  <td
                    style={{ cursor: isView ? "default" : "pointer" }}
                    onClick={() => handleAddLeave(leave)}
                  >
                    {leave.leave_name}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="leave_comp_table">
          <table>
            <thead>
              <tr>
                <th>Leave</th>
                <th className="leave_th_remove">Remove</th>
              </tr>
            </thead>
            <tbody>
              {templateLeaves.length === 0 ? (
                <tr>
                  <td colSpan="2">No leaves added yet</td>
                </tr>
              ) : (
                templateLeaves.map((leave) => (
                  <tr key={leave._id}>
                    <td>
                      {leave.leave_name}
                      {leave.abbreviation && ` (${leave.abbreviation})`}
                    </td>
                    <td>
                      {!isView && (
                        <button
                          title="Delete"
                          onClick={() => handleRemoveLeave(leave._id)}
                        >
                          <MdDelete />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!isView && (
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <button className="leave_submit_btn" onClick={handleSubmit}>
            {mode === "edit" ? "Update Template" : "Submit Template"}
          </button>
        </div>
      )}
      {showPopup && <Popup />}
    </div>
  );
}
