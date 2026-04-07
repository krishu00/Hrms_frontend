import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import DisplayDetailsOfUser from "../ProfileComponent/DisplayDetailsOfUser";
import "../../ComponentsCss/GroupsSection/DisplayGroupDetails.css";

function DisplayGroupDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const [groupData, setGroupData] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMode, setPopupMode] = useState(""); // 'create' or 'edit'
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberDetails, setMemberDetails] = useState({});
  const { state } = location;
  const group = state?.group;

  // Fetch group members data
  const fetchGroupData = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/group/${group._id}/view-members`
      );
      if (response.data.success) {
        setGroupData(response.data.data);
      } else {
        console.error("Failed to fetch group data:", response.data.message);
      }
    } catch (error) {
      console.error(
        "Error fetching group data:",
        error.response?.data || error.message
      );
    }
  };

  useEffect(() => {
    fetchGroupData();
  }, [group._id]);

  useEffect(() => {
    if (!group) {
      navigate("/dashboard/group");
    }
  }, [group, navigate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const members = groupData.length > 0 ? groupData[0].members : [];

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionChange = (option) => {
    if (option === "Create") {
      setPopupMode("create");
      setShowPopup(true);
      setSelectedMember(null); // Reset member selection
    } else if (option === "Edit") {
      setPopupMode("edit");
      setShowPopup(true);
    }
  };

  const handleAddMember = async () => {
    try {
      const requestData = {
        data: {
          new_member: {
            employee_id: memberDetails.employee_id,
          },
        },
      };

      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/group/${group._id}/add-member`,
        requestData
      );

      if (response.data.success) {
        await fetchGroupData();
        setShowPopup(false);
        setMemberDetails({});
      } else {
        console.error("Failed to add member:", response.data.message);
      }
    } catch (error) {
      console.error(
        "Error adding member:",
        error.response?.data || error.message
      );
    }
  };

  const handleRemoveMember = async () => {
    if (!selectedMember) return;

    try {
      const requestData = {
        member_id: selectedMember._id,
      };

      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL}/group/${group._id}/remove-member`,
        {
          data: requestData,
        }
      );

      if (response.data.success) {
        await fetchGroupData();
        setShowPopup(false);
        setSelectedMember(null);
      } else {
        console.error("Failed to remove member:", response.data.message);
      }
    } catch (error) {
      console.error(
        "Error removing member:",
        error.response?.data || error.message
      );
    }
  };
  return (
    <div className="group-container">
      <div className="group-header">
        <h1 className="group_head">
          Group Name: <span className="group_content">{group.name}</span>
        </h1>
        <h1 className="group_head">
          Description:{" "}
          <span className="group_content group_descrip">
            {group.description}
          </span>
        </h1>
      </div>

      <div className="group-table-container">
        <div className="header-with-dropdown">
          <h2 className="group_membaer_heading">Group Members</h2>
          <div className="dropdown_create" ref={dropdownRef}>
            <button className="create-button" onClick={toggleDropdown}>
              Member
              {isOpen ? (
                <FaChevronUp className="dropdown-arrow" />
              ) : (
                <FaChevronDown className="dropdown-arrow" />
              )}
            </button>
            {isOpen && (
              <div className="dropdown-options_create">
                <div
                  className="dropdown-option"
                  onClick={() => handleOptionChange("Create")}
                >
                  Add Member
                </div>
                <div
                  className="dropdown-option"
                  onClick={() => handleOptionChange("Edit")}
                >
                  Remove Member
                </div>
              </div>
            )}
          </div>
        </div>

        {members.length > 0 ? (
          <div className="table">
            <div className="header-row details_row">
              <div>Member No.</div>
              <div>Employee ID</div>
              <div>Employee Name</div>
            </div>

            {members.map((member, index) => (
              <div
                className="data-row details_row"
                key={member._id}
                onClick={() => {
                  setSelectedMember(member);
                  setPopupMode("edit");
                  setShowPopup(true);
                }}
              >
                <div>{index + 1}</div>
                <div>{member.employee_id}</div>
                <div>{member.employee_name}</div>
              </div>
            ))}
          </div>
        ) : (
          <p>No members found in this group.</p>
        )}
      </div>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <button
              className="close-button"
              onClick={() => setShowPopup(false)}
            >
              &times;
            </button>
            <DisplayDetailsOfUser
              key={selectedMember?._id || "new-member"}
              header={popupMode === "create" ? "Add Member" : "Remove Member"}
              mode={popupMode}
              employee_id={
                popupMode === "edit" ? "" : selectedMember?.employee_id // Render blank for remove mode
              }
              onChange={(field, value) =>
                setMemberDetails((prevData) => ({
                  ...prevData,
                  [field]: value,
                }))
              }
            />
            {popupMode === "create" ? (
              <button className="group_add_member" onClick={handleAddMember}>
                Add Member
              </button>
            ) : (
              <button className="group_add_member" onClick={handleRemoveMember}>
                Remove Member
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default DisplayGroupDetails;
