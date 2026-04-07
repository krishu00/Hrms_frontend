import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import DisplayDetailsOfUser from "../ProfileComponent/DisplayDetailsOfUser";
import "../../ComponentsCss/GroupsSection/CreateGroup.css";
import { FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { usePopup } from "../../../context/popup-context/Popup";
import { Popup } from "../../Utils/Popup/Popup";

function CreateGroup() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showPopup, setShowPopup, setMessage } = usePopup();

  const groupData = location.state?.groupData?.[0];

  const [data, setData] = useState({
    name: "", // User will input this
    description: "", // User will input this
    leave_template_id: groupData?.leave_template_id || "", // Pre-filled from groupData
    wfh_template_id: groupData?.wfh_template_id || "", // Pre-filled from groupData
    new_asset_template_id: groupData?.new_asset_template_id || "", // Pre-filled from groupData
    repair_asset_template_id: groupData?.repair_asset_template_id || "", // Pre-filled from groupData
    hr_template_id: groupData?.hr_template_id || "", // Pre-filled from groupData
  });

  const handleSubmit = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/group/create-new`,
        { data },
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setShowPopup(true);
        setMessage("Group created successfully!");
        setTimeout(() => setShowPopup(false), 3000);
        //alert("Group created successfully!");
        navigate("/dashboard/group");
      } else {
        console.error("API Error:", response.data.message);
        setShowPopup(true);
        setMessage("Failed to create group: " + response.data.message);
        setTimeout(() => setShowPopup(false), 3000);
        //alert("Failed to create group: " + response.data.message);
      }
    } catch (error) {
      console.error(
        "Error Submitting Form Data:",
        error.response?.data || error.message
      );
      setShowPopup(true);
      setMessage("An error occurred. Please try again.");
      setTimeout(() => setShowPopup(false), 3000);
      //alert("An error occurred. Please try again.");
    }
  };

  return (
    <div className="create_group_container">
      <h1>Create Group</h1>

      <DisplayDetailsOfUser
        header="Group Details"
        mode="create"
        name={data.name}
        description={data.description}
        wfh_template_id={data.wfh_template_id}
        repair_asset_template_id={data.repair_asset_template_id}
        new_asset_template_id={data.new_asset_template_id}
        leave_template_id={data.leave_template_id}
        hr_template_id={data.hr_template_id}
        onChange={(field, value) =>
          setData((prevData) => ({
            ...prevData,
            [field]: value,
          }))
        }
      />

      <div className="group-btn-section">
        <button
          className="group_submitbtn"
          onClick={handleSubmit}
          aria-label="Submit group"
        >
          Submit Group
        </button>
      </div>
      { showPopup && <Popup /> }
    </div>
  );
}

export default CreateGroup;
