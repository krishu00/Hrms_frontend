import React, { useState, useEffect, useRef } from "react";
import debounce from 'lodash/debounce';
import "../../ComponentsCss/Users/CompanyAllUsers.css";
import axios from "axios";
import {
  FaEye,
  FaUsers,
  FaUser,
  FaPen,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { useNavigate, NavLink, redirect } from "react-router-dom";
import { tr } from "date-fns/locale";
import { IoIosClose } from "react-icons/io";
import { useMode } from "../../../context/mode-context/mode-context";
import { usePopup } from "../../../context/popup-context/Popup";
import { Popup } from "../../Utils/Popup/Popup";
import Button from "../../../context/GlobalButton/globalButton";

function CompanyAllUsers() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedArrow, setselectedArrow] = useState("single");
  const [selectedOption, setSelectedOption] = useState("single");
  const dropdownRef = useRef(null);
  const [data, setData] = useState([]);
  const [companyCode, setCompanyCode] = useState("");
  const navigate = useNavigate();
  const [isMultiPopupOpen, setIsMultiPopupOpen] = useState(false);
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [limit, setLimit] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalUsers, setTotalUsers] = useState([]);
  const { setMode } = useMode();
  const { showPopup, setShowPopup, setMessage } = usePopup();
  const [status, setStatus] = useState("active"); // default Active
  const [hasFetchedAllUsers, setHasFetchedAllUsers] = useState(false);

  const usersPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  // const [data, setData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  console.log("limit value", totalCount);

  const totalPages = Math.ceil(totalCount / usersPerPage);

  const handlePageClick = (pageNumber) => {
    setLimit((pageNumber - 1) * usersPerPage);
  };

  const getCompanyCodeFromCookies = () => {
    const cookies = document.cookie.split("; ");
    const companyCookie = cookies.find((cookie) =>
      cookie.startsWith("companyCode=")
    );
    console.log("krrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr", companyCookie);
    const job_roles = cookies.find((cookie) => cookie.startsWith("job_roles="));
    console.log("job_roles", job_roles);
    const employee_id = cookies.find((cookie) =>
      cookie.startsWith("employee_id=")
    );
    console.log("employee_id", employee_id);

    return companyCookie ? companyCookie.split("=")[1] : null;
  };
  // const fetchTotalUsers = async (code) => {
  //    const tokens = document.cookie
  //       .split("; ")
  //       .find((row) => row.startsWith("authToken="))
  //       ?.split("=")[1];
  //    const searchresponse = await axios.get(
  //       `${process.env.REACT_APP_API_URL}/company/${code}/total-employees?status=${status}`,
  //       { headers: { Authorization: `Bearer ${tokens}` } });
  //    setTotalUsers(searchresponse.data.employees);
  // };
  const fetchTotalUsers = async (code, search = "", previewLimit = 10,  skip = (currentPage - 1) * usersPerPage) => {
  const token = document.cookie.split("; ").find(r => r.startsWith("authToken="))?.split("=")[1];
  const params = new URLSearchParams();
  params.append("status", status);
  if (search) params.append("search", search);
  params.append("previewLimit", previewLimit);
  params.append("skip", skip);

  const resp = await axios.get(
    `${process.env.REACT_APP_API_URL}/company/${code}/employees?${params.toString()}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  setTotalCount(resp.data.totalCount);
  setData(resp.data.employees); // small preview
};
  //filter
  // const handleInputChange = async({event,code}) => {
  //   const term = event.target.value.toLowerCase();
  //   setSearchTerm(term);

  //   if (!hasFetchedAllUsers) {
  //     await fetchTotalUsers(code);
  //     setHasFetchedAllUsers(true);
  //   }

  //   if (term) {
  //     const filteredData = totalUsers.filter(
  //       (user) =>
  //         user.employee_details?.name?.toLowerCase().includes(term) ||
  //         user.employee_details?.email?.toLowerCase().includes(term) ||
  //         user.employee_id?.toLowerCase().includes(term) ||
  //         user.official_details?.department?.toLowerCase().includes(term) ||
  //         user.official_details?.designation?.toLowerCase().includes(term) ||
  //         user.official_details?.reporting_manager?.toLowerCase().includes(term)
  //     );
  //     setData(filteredData);
  //   } else {
  //     userDetails(); // Refetch all data if search is cleared
  //   }
  // };
  // debounce using lodash and a ref; single source of debounce + cleanup
  const debouncedFetchRef = useRef(null);

  useEffect(() => {
    debouncedFetchRef.current = debounce((c, t) => {
      fetchTotalUsers(c, t, 10);
    }, 700);

    return () => {
      if (debouncedFetchRef.current && debouncedFetchRef.current.cancel) {
        debouncedFetchRef.current.cancel();
      }
    };
  }, []);

  const handleInputChange = ({ event, code }) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);
    if (debouncedFetchRef.current) debouncedFetchRef.current(code, term);
  };

  const handleOptionChange = (option) => {
    setSelectedOption(option);
    setIsOpen(false); // Close the dropdown after selecting an option

    // Navigate based on selected option
    if (option === "single") {
      navigate("/dashboard/users/Users");
    } else if (option === "multi") {
      // navigate("/dashboard/users/create-multi-users");
      setIsMultiPopupOpen(true);
    }
  };
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    console.log("File uploaded:", file);
  };

  const handleSubmit = () => {
    // Handle form submission
    console.log("Company Code:", companyCode);
    // console.log("File:", file);
    setIsMultiPopupOpen(false); // Close the popup after submission
  };

  const handleNextClick = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePreviousClick = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  console.log(limit, "======================");

  // in this section call Api according to limit set default 10
  // const userDetails = async (code) => {
  //   try {
  //     const token = document.cookie
  //       .split("; ")
  //       .find((row) => row.startsWith("authToken="))
  //       ?.split("=")[1];

  //     const response = await axios.get(
  //       `${process.env.REACT_APP_API_URL}/company/${
  //         code ?? companyCode
  //       }/employees`,
  //       {
  //         headers: { Authorization: `Bearer ${token}` },
  //       }
  //     );
  //     console.log(response.data.employees, "data");

  //     let dataToShow;
  //     if (response.data.employees.length >= 10) {
  //       dataToShow = response.data.employees.slice(
  //         limit + 10 > response.data.employees.length
  //           ? response.data.employees.length - 10
  //           : limit,
  //         limit + 10
  //       );
  //       setData(dataToShow);
  //     } else {
  //       dataToShow = response.data.employees.slice(0, 10);
  //       setData(dataToShow);
  //     }
  //     console.log(dataToShow, "===========================================");

  //     setTotalUsers(response.data.employees);
  //   } catch (error) {
  //     console.error(
  //       "Error fetching employees:",
  //       error.response?.data || error.message
  //     );
  //   }
  // };
  const userDetails = async (code) => {
    try {
      const skip = (currentPage - 1) * usersPerPage;

      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("authToken="))
        ?.split("=")[1];

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/company/${code}/employees?status=${status}&limit=${usersPerPage}&skip=${skip}&search=${searchTerm}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log(response.data.totalCount, "data...");
      setData(response.data.employees); // only 10 users
      setTotalCount(response.data.totalCount); // TOTAL USERS (from backend)
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  console.log("totalUsers", totalUsers.length);
  console.log("data", data);
  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  // // call userDetails functions when limit call
  // useEffect(() => {
  //   const code = getCompanyCodeFromCookies();
  //   console.log(code, "code");

  //   setCompanyCode(code);
  //   if (code) {
  //     userDetails(code);
  //   }
  //   console.log("employe data ", data);
  // }, [companyCode, limit]);

  // call userDetails functions when limit call
  // 1️⃣ Read cookie only once
  useEffect(() => {
    const code = getCompanyCodeFromCookies();
    if (code) {
      setCompanyCode(code);
    }
  }, []);

  useEffect(() => {
    if (companyCode) {
      userDetails(companyCode);
    }
  }, [companyCode, currentPage, status]);

  useEffect(() => {
    setHasFetchedAllUsers(false);
  }, [status]);

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
  const handleCompanyCodeChange = (e) => setCompanyCode(e.target.value);
  // Handle file input change
  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const downloadExcelTemplate = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/excel-template`,

        {
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data]);
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.setAttribute("download", "excelTemplate.xlsx");
      link.click();

      console.log("Template downloaded successfully.");
    } catch (err) {
      console.error("Error downloading template:", err);
      // setError("Error downloading the template.");
    } finally {
      // setLoading(false);
    }
  };
  const toggleBulkUpload = () => {
    setBulkUploadOpen((prev) => !prev);
  };

  const uploadBulkUsers = async () => {
    if (!file || !companyCode) {
      setShowPopup(true);
      setMessage("Please select a file and enter the company code.");
      setTimeout(() => setShowPopup(false), 3000);
      //alert("Please select a file and enter the company code.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("companyCode", companyCode);

    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/upload-bulk/${companyCode}`,
        formData,
        { responseType: "blob" } // Expect a blob for Excel download
      );

      // Handle JSON response or Excel file download
      const contentType = response.headers["content-type"];
      if (contentType.includes("application/json")) {
        const reader = new FileReader();
        reader.onload = () => {
          const jsonResponse = JSON.parse(reader.result);
          if (jsonResponse.message === "Bulk upload successful") {
            setShowPopup(true);
            setMessage("Bulk upload successful! Users have been added.");
            setTimeout(() => setShowPopup(false), 3000);
            //alert("Bulk upload successful! Users have been added.");
            setIsMultiPopupOpen(false);
          } else {
            setError("Unexpected response from the server.");
          }
        };
        reader.readAsText(response.data);
      } else if (
        contentType.includes(
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
      ) {
        const contentDisposition = response.headers["content-disposition"];
        const fileName = contentDisposition
          ? contentDisposition.split("filename=")[1]
          : "skipped_emails.xlsx";

        const blob = new Blob([response.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = fileName.replace(/"/g, ""); // Remove quotes from the filename
        link.click();
        setIsMultiPopupOpen(false);
      } else {
        setError("Unknown response type from the server.");
      }
    } catch (err) {
      console.error("Error uploading bulk users:", err);
      setError("Error uploading bulk users.");
    } finally {
      setLoading(false);
      // redirect("/dashboard/users");
    }
  };

  return (
    <div className="company_container">
      <div className="header">
        <div className="company_title">
          <h1 className="title">All Users</h1>
        </div>

        <div className="dropdown_create" ref={dropdownRef}>
          <button className="create-button" onClick={toggleDropdown}>
            Create
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
                onClick={() => handleOptionChange("single")}
              >
                <FaUser /> Single User
              </div>
              <div
                className="dropdown-option"
                onClick={() => handleOptionChange("multi")}
              >
                <FaUsers /> Multi Users
              </div>
            </div>
          )}

          {isMultiPopupOpen && (
            <div className="popup-overlay">
              <div className="popup">
                <h2 className="bulk_heading">Bulk User Upload</h2>

                <div className="popup-actions">
                  <div className="popup-actions">
                    <label className="enterCompanyCode">
                      Enter Company Code:
                    </label>
                    <div>
                      <select
                        onChange={handleCompanyCodeChange}
                        disabled={loading}
                        className="companyCodeSelect"
                        onClick={() => setselectedArrow(!selectedArrow)}
                      >
                        <option value="" disabled selected>
                          Select Company
                        </option>
                        <option value="1">Daksh Electronics</option>
                        <option value="0">Super Admin</option>
                        <option value="2">MTI Pvt Ltd</option>
                        <option value="3">Daksh Global Pvt Ltd</option>
                        <option value="4">Marche Ricche pri ltd</option>
                        <option value="5">VNG Enterprises Pvt. Ltd.</option>
                      </select>
                      <span className="leaveiconarrow">
                        {selectedArrow ? <FaChevronDown /> : <FaChevronUp />}
                      </span>
                    </div>
                    <div className="file-upload-bulk">
                      <input
                        type="file"
                        onChange={handleFileChange}
                        disabled={loading}
                        name="file"
                      />
                    </div>
                    <div className="submitBtnmutli">
                      <button
                        className="uploadBulkBtn"
                        onClick={uploadBulkUsers}
                        disabled={loading || !companyCode || !file}
                      >
                        Submit
                      </button>

                      <button
                        className="SampleDownBtn"
                        onClick={downloadExcelTemplate}
                      >
                        Download Sample
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <button
                className="closeBtnBulk"
                onClick={() => {
                  setIsMultiPopupOpen(false);
                  setBulkUploadOpen(false);
                }}
              >
                <IoIosClose />
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="search-user-main">
        {/* Status Dropdown with datalist */}
        <label className="status-header">Filter by Status: </label>

        <input
          type="text"
          placeholder="Filter by Status"
          className="user-search"
          list="statusList"
          value={status}
          onChange={(e) => setStatus(e.target.value.toLowerCase())}
        />
        <datalist id="statusList">
          <option value="Active" />
          <option value="Inactive" />
          <option value="Dummy" />
        </datalist>

        {/* Search Input */}
        <input
          type="text"
          name="name"
          placeholder="Filter User by Id,Name"
          className="user-search"
          list="userList"
          onChange={(e) => handleInputChange({event:e,code:companyCode})}
        />
        <datalist id="userList">
          {data.map((user, index) => (
            <option key={index} value={user.employee_details.name} />
          ))}
        </datalist>
      </div>

      {/* <div className="search-user-main">
        
        <input
          type="text"
          name="name"
          placeholder="Filter User"
          className="user-search"
          list="userList"
          onChange={handleInputChange}
        />
        <datalist id="userList">
          {data.map((user, index) => (
            <option key={index} value={user.employee_details.name} />
          ))}
        </datalist>
      </div> */}
      <div className="table-container">
        <div className="header-rows">
          <div>Sr.No</div>
          <div>Employee ID</div>
          <div>Name</div>
          <div>Email</div>
          <div>Department</div>
          <div>Designation</div>
          <div>Reporting Manager </div>
          <div>Action</div>
        </div>

        {data &&
          data.map((user, index) => {
            const { employee_details, official_details, employee_id } = user;
            const { name, email } = employee_details;
            const { designation, reporting_manager, department } =
              official_details;

            // const nameIndex = totalUsers.indexOf(data);
            // console.log("nameIndex", nameIndex);

            return (
              <div className="data-rows" key={index}>
                <div>{(currentPage - 1) * usersPerPage + (index + 1)}</div>
                <div>{employee_id}</div>
                <div>{name}</div>
                <div>{email}</div>
                <div className="data-row-department"> {department}</div>
                <div className="data-row-designation">{designation}</div>
                <div> {reporting_manager} </div>
                <div className="action-icons">
                  <div className="dropdown-item-user">
                    <NavLink
                      to="/dashboard/users/profile"
                      state={{ employee: user }}
                    >
                      <FaEye
                        onClick={() => setMode("readonly")}
                        className="action-icon"
                      />
                    </NavLink>
                    <NavLink
                      to="/dashboard/users/edit-users"
                      state={{ employee: user }}
                    >
                      <FaPen
                        onClick={() => setMode("edit")}
                        className="action-icon"
                      />
                    </NavLink>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
      {/* <div className="user_pagination">
        {limit >= 10 && (
          <button className="previous-button" onClick={handlePreviousClick}>
            <span class="material-icons">chevron_left</span>
          </button>
        )}
        {limit + 10 < totalUsers.length && (
          <button className="previous-button" onClick={handleNextClick}>
            <span class="material-icons">chevron_right</span>
          </button>
        )}
      </div>
      {showPopup && <Popup />}
    </div> */}
      <div className="user_pagination">
        <button
          className={`pagination-arrow${currentPage === 1 ? " disabled" : ""}`}
          onClick={handlePreviousClick}
          disabled={currentPage === 1}
        >
          <span className="material-icons">chevron_left</span>
        </button>

        <span className="pagination-info">
          Page {currentPage} of {totalPages}
        </span>

        <button
          className={`pagination-arrow${
            currentPage === totalPages ? " disabled" : ""
          }`}
          onClick={handleNextClick}
          disabled={currentPage === totalPages}
        >
          <span className="material-icons">chevron_right</span>
        </button>
      </div>
    </div>
  );
}

export default CompanyAllUsers;
