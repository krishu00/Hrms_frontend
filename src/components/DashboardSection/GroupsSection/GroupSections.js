import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "../../ComponentsCss/GroupsSection/GroupsSection.css";
import { FaArrowRight, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";

function GroupSections() {
  const [groupData, setGroupData] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchGroupData = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/group/get_all`
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
  }, []);

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

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

  const handleOptionChange = (option) => {
    setIsOpen(false);

    if (option === "Create") {
      navigate("/dashboard/groups/create_group", { state: { groupData } });
    } else if (option === "Edit") {
      navigate("/dashboard/groups/edit_group");
    }
  };

  return (
    <div className="company_container group_container">
      <div className="header">
        <div className="company_title">
          <h1 className="title">Group Sections</h1>
        </div>

        <div className="dropdown_create" ref={dropdownRef}>
          <button className="create-button" onClick={toggleDropdown}>
            Create Group
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
                Create Group
              </div>
              <div
                className="dropdown-option"
                onClick={() => handleOptionChange("Edit")}
              >
                Edit Group
              </div>
            </div>
          )}
        </div>
      </div>
    
      <div className="table-container">
        <div className="header-row group_row">
          <div>Group No.</div>
          <div>Name</div>
          <div>Description</div>
          <div>Action</div>
        </div>

        {groupData.map((group, index) => (
          <div className="data-row group_row" key={group._id}>
            <div>{index + 1}</div>
            <div>{group.name}</div>
            <div>{group.description}</div>
            <div className="action-icons">
              <NavLink to={`/dashboard/groups/details `} state={{ group }}>
                <FaArrowRight className="action-icon" />
              </NavLink>
            </div>
          </div>
        ))}

        {groupData.length === 0 && (
          <div className="data-row">
            <div colSpan="4">No groups available.</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default GroupSections;
