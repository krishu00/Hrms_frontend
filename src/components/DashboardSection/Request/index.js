import React, { useState, useRef, useEffect } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import axios from "axios";
import "../../ComponentsCss/Request/Request.css";
import RequestedByYou from "./RequestedByYou";
import AppliedByYou from "./AppliedToYou";

import "../../ComponentsCss/Request/ApplyRequests/RepairOfAsset/RepairOfAsset.css";

import RepairOfAsset from "./ApplyRequests/RepairOfAsset";
import { AiOutlineClose } from "react-icons/ai";
import NewAssets from "./ApplyRequests/NewAssets";
import ApplyForLeave from "./ApplyRequests/ApplyForLeave/index";
import WorkFromHome from "./ApplyRequests/WorkFromHome";
import RequestToHr from "./ApplyRequests/RequestToHr";
import CompOffComponent from "./ApplyRequests/CompOff/CompOff"
import { set } from "date-fns";
import RegulariseForm from "../../Utils/RegulariseForm/RegulariseForm";
import Button from "../../../context/GlobalButton/globalButton";

export default function Request() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [leaveBalanceOpen, setLeaveBalanceOpen] = useState(false);
  const [leaveBalance, setLeaveBalance] = useState([]);
  const [requestedData, setRequestedData] = useState([]);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [newAssetOpen, setNewAssetOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [workHomeOpen, setWorkHomeOpen] = useState(false);
  const [requestHrOpen, setRequstHrOpen] = useState(false);
  const [regularise, setRegularise] = useState(false);
  const [compOff, setCompOff] = useState(false);
  // open button functions
  function repairAsset() {
    setIsOpen(true);
    setNewAssetOpen(false);
    setLeaveOpen(false);
    setWorkHomeOpen(false);
    setRequstHrOpen(false);
    setRegularise(false);
    setCompOff(false);
  }

  function newAsset() {
    setNewAssetOpen(true);
    setLeaveOpen(false);
    setWorkHomeOpen(false);
    setRequstHrOpen(false);
    setIsOpen(false);
    setCompOff(false);
  }
  function leaveApply() {
    setLeaveOpen(true);
    setNewAssetOpen(false);
    setWorkHomeOpen(false);
    setIsOpen(false);
    setRequstHrOpen(false);
    setRegularise(false);
    setCompOff(false);
  }
  function workHome() {
    setWorkHomeOpen(true);
    setNewAssetOpen(false);
    setLeaveOpen(false);
    setIsOpen(false);
    setRequstHrOpen(false);
    setRegularise(false);
    setCompOff(false);
  }

  function RequstHr() {
    setRequstHrOpen(true);
    setIsOpen(false);
    setNewAssetOpen(false);
    setLeaveOpen(false);
    setWorkHomeOpen(false);
    setRegularise(false);
    setCompOff(false);
  }
  function Regularise() {
    setRequstHrOpen(false);
    setIsOpen(false);
    setNewAssetOpen(false);
    setLeaveOpen(false);
    setWorkHomeOpen(false);
    setRegularise(true);
    setCompOff(false);
  }
  function CompOff() {
    setCompOff(true);
    setRequstHrOpen(false);
    setIsOpen(false);
    setNewAssetOpen(false);
    setLeaveOpen(false);
    setWorkHomeOpen(false);
    setRegularise(false);
  }
  function closeButtonRepaiAsset() {
    setIsOpen(false);
  }
  function closeButtonCompOff(){
    setCompOff(false)
  }
  function closeButtonNewAsset() {
    setNewAssetOpen(false);
  }

  function closeButtonLeave() {
    setLeaveOpen(false);
  }
  function closeButtonWorkHome() {
    setWorkHomeOpen(false);
  }
  function closeButtonRequestHr() {
    setRequstHrOpen(false);
  }
  useEffect(() => {
    if (isDropdownOpen && dropdownRef.current && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      dropdownRef.current.style.width = `${buttonRect.width}px`;
    }
  }, [isDropdownOpen]);

  // Function to retrieve company code and employee ID from cookies
  const getCompanyCodeAndEmployeeIdFromCookies = () => {
    const cookies = Object.fromEntries(
      document.cookie.split("; ").map((cookie) => cookie.split("="))
    );

    const companyCode = cookies["companyCode"] || null;
    const employeeId = cookies["employee_id"] || null;

    return { companyCode, employeeId };
  };

  // Fetch data from API
  useEffect(() => {
    const fetchRequestedData = async () => {
      try {
        const { companyCode, employeeId } =
          getCompanyCodeAndEmployeeIdFromCookies();
        console.log("Company Code:", companyCode);
        console.log("Employee ID:", employeeId);

        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/request/get_all_requested_by_me`
        );
        if (response.data) {
          setRequestedData(response.data.data); // Assuming the data array is inside the `data` key
        }
      } catch (error) {
        console.error("Error fetching requested data:", error);
      }
    };

    fetchRequestedData();
  }, []);

  // useEffect(() => {
  //   const fetchLeaveBalance = async () => {
  //     try {
  //       const { companyCode, employeeId } =
  //         getCompanyCodeAndEmployeeIdFromCookies();
  //       console.log("Company Code:", companyCode);
  //       console.log("Employee ID:", employeeId);

  //       const response = await axios.get(
  //         `${process.env.REACT_APP_API_URL}/leaves-balance/get-leaves-balance`
  //       );
  //       if (response.data) {
  //         setLeaveBalance(response.data.data); // Assuming the data array is inside the `data` key
  //       }
  //     } catch (error) {
  //       console.error("Error fetching requested data:", error);
  //     }
  //   };
  //   fetchLeaveBalance();
  // }, []);
  // console.log("Leave Balance:", leaveBalance);

  useEffect(() => {
    const fetchLeaveData = async () => {
      try {
        const { employeeId } = getCompanyCodeAndEmployeeIdFromCookies();

        let leaveData = [];

        // 1️⃣ Try Leave Balance API
        try {
          const balanceResponse = await axios.get(
            `${process.env.REACT_APP_API_URL}/leaves-balance/get-leaves-balance`
          );
          leaveData = balanceResponse.data?.data?.leaveDetails || [];
        } catch (err) {
          console.warn("Leave balance API failed, will fetch template instead");
        }

        // 2️⃣ If no data or all zero → fetch template API
        if (
          !leaveData.length ||
          leaveData.every((l) => l.closingBalance === 0)
        ) {
          const templateResponse = await axios.get(
            `${process.env.REACT_APP_API_URL}/leave_template/employee/${employeeId}`
          );

          const templateLeaves = templateResponse.data?.data?.leaves || [];

          leaveData = templateLeaves.map((tl) => ({
            closingBalance: 0,
            leaveTypeName: tl.name || "N/A",
          }));
        }

        // 3️⃣ Set for UI
        setLeaveBalance({ leaveDetails: leaveData });
      } catch (error) {
        console.error("Error fetching leave data:", error);
      }
    };

    fetchLeaveData();
  }, []);

  useEffect(() => {
    if (isDropdownOpen) {
      const handleClickOutside = (event) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target) &&
          buttonRef.current &&
          !buttonRef.current.contains(event.target)
        ) {
          setIsDropdownOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isDropdownOpen]);

  useEffect(() => {
    if (isDropdownOpen && dropdownRef.current && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      dropdownRef.current.style.width = `${buttonRect.width}px`;
    }
  }, [isDropdownOpen]);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  const toggleLeaveBalance = () => {
    setLeaveBalanceOpen(!leaveBalanceOpen);
  };

  // close all request when user sucesfully submit the request
  const closeLeavePopup = () => {
    setLeaveOpen(false);
    // window.location.reload();
  };
  const closeNewAssets = () => {
    setNewAssetOpen(false);
  };
  const closeRepairAssets = () => {
    setIsOpen(false);
  };

  const closeWFH = () => {
    setWorkHomeOpen(false);
  };
  const closeRequestToHr = () => {
    setRequstHrOpen(false);
  };
  const closeCompOff = ()=>{
    setCompOff(false)
  }
  const closeRegulariseForm = () => {
    setRegularise(false);
  };

  return (
    <div className="request-container">
      <div className="apply-button-container">
        <Button
          text="Balance"
          // className="balance-button apply-button"
          onClick={toggleLeaveBalance}
        ></Button>
        <button
          text="Balance"
          ref={buttonRef}
          className="apply-button"
          onClick={toggleDropdown}
        >
          Apply For {isDropdownOpen ? <FaChevronUp /> : <FaChevronDown />}
        </button>

        {isDropdownOpen && (
          <div ref={dropdownRef} className="dropdown-menu">
            <button onClick={leaveApply}>Leave</button>
            {/* <button onClick={workHome}>Work from home</button> */}
            <button onClick={newAsset}>New asset</button>
            <button onClick={repairAsset}>Repair asset</button>
            <button onClick={RequstHr}>Request to HR</button>
            <button onClick={Regularise}>Regularize</button>
            <button onClick={CompOff}>Comp Off</button>
          </div>
        )}
      </div>
      {isOpen && (
        <div className="popup-main">
          <div className="crossIcon">
            <span
              onClick={closeButtonRepaiAsset}
              className="crossIconOfNewAsset"
              style={{
                marginTop: "35px",
              }}
            >
              <AiOutlineClose onClick={closeRepairAssets} />
            </span>
            <RepairOfAsset onClose={closeRepairAssets} />
          </div>
        </div>
      )}
      {newAssetOpen && (
        <div className="popup-main">
          <div className="crossIcon">
            <span
              className="crossIconOfNewAsset"
              onClick={closeButtonNewAsset}
              style={{
                marginTop: "35px",
              }}
            >
              <AiOutlineClose onClick={closeNewAssets} />
            </span>
            <NewAssets onClose={closeNewAssets} />
          </div>
        </div>
      )}

      {leaveOpen && (
        <div className="popup-main">
          <div className="crossIcon">
            <span
              className="crossIconOfNewAsset"
              onClick={closeButtonLeave}
              style={{
                marginTop: "20px",
                zIndex: "2",
              }}
            >
              <AiOutlineClose onClick={closeLeavePopup} />
            </span>
            <ApplyForLeave onClose={closeLeavePopup} 
            leaveBalance={leaveBalance}
             />
          </div>
        </div>
      )}

      {workHomeOpen && (
        <div className="popup-main">
          <div className="crossIcon">
            <span
              className="crossIconOfNewAsset"
              onClick={closeButtonWorkHome}
              style={{
                marginTop: "20px",
                zIndex: "2",
              }}
            >
              <AiOutlineClose onClick={closeWFH} />
            </span>
            <WorkFromHome onClose={closeWFH} />
          </div>
        </div>
      )}

      {requestHrOpen && (
        <div className="popup-main">
          <div className="crossIcon">
            <span
              className="crossIconOfNewAsset"
              onClick={closeButtonRequestHr}
              style={{
                alignContent: "center",
                marginLeft: "520px",
                position: "absolute",
                marginTop: "20px",
                zIndex: "2",
              }}
            >
              <AiOutlineClose onClick={closeRequestToHr} />
            </span>
            <RequestToHr onClose={closeRequestToHr} />
          </div>
        </div>
      )}
      {regularise && (
        <div className="popup-main">
          <RegulariseForm onClose={closeRegulariseForm} />
        </div>
      )}
      {compOff && (
        <div className="popup-main">
          <div className="crossIcon">
            <span
              className="crossIconOfNewAsset"
              onClick={closeButtonCompOff}
              style={{
                marginTop: "35px",
              }}
            >
              <AiOutlineClose onClick={closeCompOff} />
            </span>
            <CompOffComponent onClose={closeCompOff} />
          </div>
        </div>
      )}

      {leaveBalanceOpen && (
        <div className="popup-main">
          <div className="crossIcon">
            {/* <span
              className="crossIconOfleaveBalance"
              onClick={toggleLeaveBalance}
            >
              <AiOutlineClose onClick={toggleLeaveBalance} />
            </span> */}
            <div className="leave-balance-popup">
              <span
                className="crossIconOfleaveBalance"
                onClick={toggleLeaveBalance}
              >
                <AiOutlineClose onClick={toggleLeaveBalance} />
              </span>
              <h2 className="leaveBalance_heading">Leave Balance</h2>
              <div className="leave-balance-list">
                {leaveBalance?.leaveDetails?.map((leave, index) => (
                  <div key={index} className="leave-balance-item">
                    <span className="leave-day_border">
                      <span className="leave-days">{leave?.closingBalance}</span>
                    </span>
                    <span className="leave-type">
                      {leave?.leaveTypeName || "N/A"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      <RequestedByYou />
      <AppliedByYou />
    </div>
  );
}
