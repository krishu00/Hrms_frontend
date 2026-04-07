import React from "react";
import { useEffect, useState, useRef } from "react";
import { IoArrowBackOutline } from "react-icons/io5";
import validator from "validator";
import "../../ComponentsCss/NewUserComponent/NewUserSection.css";
import axios from "axios";
import { useMode } from "../../../context/mode-context/mode-context";
import { useLocation, useNavigate } from "react-router-dom";
import { usePopup } from "../../../context/popup-context/Popup";
import { Popup } from "../../Utils/Popup/Popup";
import Button from "../../../context/GlobalButton/globalButton";

export default function NewUserSection({ employeeData }) {
  const section = [
    { id: 0, label: "Employee Details" },
    { id: 1, label: "Official Details" },
    { id: 2, label: "Personal Details" },
    { id: 3, label: "Other Details" },
    { id: 4, label: "Bank Details" },
    { id: 5, label: "Insurance Details" },
    { id: 6, label: "PF Details" },
    { id: 7, label: "Current Address" },
    { id: 8, label: "Permanent Address" },
  ];

  const sectionKeys = [
    "employee_details",
    "official_details",
    "personal_details",
    "other_details",
    "bank_details",
    "insurance_details",
    "pf_details",
    "current_address",
    "permanent_address",
  ];

  // Define required fields for each section
  const requiredFields = {
    employee_details: ["name", "gender", "contact", "email"],
    official_details: [
      "department",
      "designation",
      "employee_status",
      "role",
      "reporting_manager",
      "employee_type",
      "job_roles",
      "weekly_holiday_rule",
    ],
    personal_details: [
      "joining_date",
      "pan",
      "personal_email",
      "date_of_birth",
      "aadharcard",
    ],
    other_details: ["marital_status", "blood_group", "passport"],
    bank_details: ["account_number", "bank_name", "ifsc_code", "branch_name"],
    insurance_details: [
      "insurance_number",
      "insurance_company",
      "ins_start_date",
      "ins_end_date",
    ],
    pf_details: [
      "esi_number",
      "pf_number",
      "entitled_to_eps",
      "restricted_basic_for_pf_calculation",
    ],
    current_address: [
      "address_line_1",
      "address_line_2",
      "landmark",
      "city",
      "pin_code",
      "state",
    ],
    permanent_address: [
      "address_line_1",
      "address_line_2",
      "landmark",
      "city",
      "pin_code",
      "state",
    ],
  };

  const location = useLocation();
  const [currentSection, setCurrentSection] = useState(0);
  const [checkedSections, setCheckedSections] = useState([0]);
  const [employeeId, setEmployeeId] = useState("");
  const initialValidity = sectionKeys.reduce((acc, key, index) => {
    acc[index] = false;
    return acc;
  }, {});
  const [sectionValidity, setSectionValidity] = useState(initialValidity);

  const [categoryData, setCategoryData] = useState([]);
  const [weeklyholidays, setWeeklyholidays] = useState([]);
  const { mode } = useMode();
  const [employee, setEmployee] = useState(
    location.state?.employee || employeeData,
  );
  const [checkIdMessage, setCheckIdMessage] = useState("");
  const [checkingId, setCheckingId] = useState(false);
  const navigate = useNavigate();
  const { showPopup, setShowPopup, setMessage, message } = usePopup();
  const [leaveTemplates, setLeaveTemplates] = useState([]);
  useEffect(() => {
    if (employeeData) {
      setEmployee(employeeData);
    }
  }, [employeeData]);

  console.log("weeklyholidays???", weeklyholidays);
  console.log("leaveTemplates", leaveTemplates);

  // console.log("employee============", employee);
  // console.log("sectionValidity", sectionValidity, checkedSections);

  const [data, setData] = useState({
    data: {
      employee_id: `${employeeId}`,
      employee_type: "",
      group_id: null,
      name: "",
      gender: "",
      contact: "",
      email: "",
      password: "Sample@123",
      pan: "",
      aadharcard: "",
      personal_email: "",
      date_of_birth: "",
      job_roles: [],
      current_address: {
        state: "",
        city: "",
        landmark: "",
        pin_code: "",
        address_line_1: "",
        address_line_2: "",
      },
      permanent_address: {
        state: "",
        city: "",
        landmark: "",
        pin_code: "",
        address_line_1: "",
        address_line_2: "",
      },
      marital_status: "",
      passport: "",
      father_name: "",
      mother_name: "",
      blood_group: "",
      role: "",
      designation: "",
      department: "",
      reporting_manager: "",
      direct_reportees: [
        {
          reportees_id: "",
          reportees_name: "",
        },
      ],
      joining_date: "",
      employee_status: "",
      payroll_type: "",
      bank_name: "",
      account_number: "",
      ifsc_code: "",
      esi_number: "",
      pf_number: "",
      entitled_to_eps: false,
      restricted_basic_for_pf_calculation: false,
      branch_name: "",
      insurance_number: "",
      insurance_company: "",
      ins_start_date: "",
      ins_end_date: "",
      mother_name: "",
      father_name: "",
    },
  });
  const [formData, setFormData] = useState(data?.data || {});

  const handleChange = (e) => {
    // const { name, value } = e.target;
    const { name, value, type, checked } = e.target;
    const finalValue = type === "checkbox" ? checked : value;
    console.log("name ", name, "value", value);

    if (name === "leave_template") {
      const selectedTemplate = leaveTemplates.find((t) => t._id === value);
      console.log("selectedTemplate", selectedTemplate);

      if (mode === "create") {
        setData((prev) => ({
          ...prev,
          data: {
            ...prev.data,
            leave_template: value,
            leave_template_name: selectedTemplate?.name || "",
          },
        }));
      } else if (mode === "edit") {
        setEmployee((prev) => ({
          ...prev,
          official_details: {
            ...(prev.official_details ?? {}),
            leave_template: value,
            leave_template_name: selectedTemplate?.name || "",
          },
        }));
      }
      return;
    }

    // Special handling for weekly_holiday_rule
    if (name === "weekly_holiday_rule") {
      const selectedRule = weeklyholidays.find((rule) => rule._id === value);

      if (mode === "create") {
        setData((prev) => ({
          ...prev,
          data: {
            ...prev.data,
            weekly_off_rule_id: value, // Store the ID
            weekly_off_rule_name: selectedRule ? selectedRule.weekDay_name : "", // Store the name
          },
        }));
      } else if (mode === "edit") {
        setEmployee((prev) => ({
          ...prev,
          official_details: {
            ...(prev.official_details ?? {}), // Safely spread official_details
            weekly_off_rule_id: value, // Store the ID
            weekly_off_rule_name: selectedRule ? selectedRule.weekDay_name : "", // Store the name
          },
        }));
      }
      return;
    }

    if (mode === "edit") {
      setEmployee((prev) => {
        const current = prev || {};
        const sectionKey = sectionKeys?.[currentSection];

        // Special fields that are not part of section objects
        if (sectionKey === "official_details") {
          if (name === "employee_type") {
            return { ...current, employee_type: value };
          } else if (name === "job_roles") {
            return { ...current, job_roles: [value] };
          }
        }

        // Handle bank details separately
        if (sectionKey === "bank_details") {
          return {
            ...current,
            account_details: {
              ...current.account_details,
              bank_details: {
                ...current.account_details?.bank_details,
                [name]: value,
              },
            },
          };
        }

        // Handle pf/esi/payroll fields that are direct children of account_details
        if (sectionKey === "pf_details") {
          return {
            ...current,
            account_details: {
              ...current.account_details,
              [name]: value,
            },
          };
        }

        // Generic section updates
        if (
          [
            "employee_details",
            "official_details",
            "personal_details",
            "other_details",
            "insurance_details",
            "current_address",
            "permanent_address",
          ].includes(sectionKey)
        ) {
          return {
            ...current,
            [sectionKey]: {
              ...current[sectionKey],
              [name]: value,
            },
          };
        }

        // Fallback
        return current;
      });
    } else {
      // Create mode
      setData((prev) => {
        const data = prev.data ?? {};
        const currentAddress = data.current_address ?? {};
        const permanentAddress = data.permanent_address ?? {};

        let updatedData = { ...data };

        if (currentSection === 7) {
          updatedData.current_address = {
            ...currentAddress,
            [name]: finalValue,
          };
        } else if (currentSection === 8) {
          updatedData.permanent_address = {
            ...permanentAddress,
            [name]: value,
          };
        } else {
          updatedData[name] = value;
        }

        return {
          ...prev,
          data: updatedData,
        };
      });
    }
  };
  const generatePassword = () => {
    const lowerCaseChars = "abcdefghijklmnopqrstuvwxyz";
    const upperCaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numberChars = "0123456789";
    const symbolChars = "!@#$%^&*()-_=+[{]}\\|;:'\",<.>/?";
    const allChars =
      lowerCaseChars + upperCaseChars + numberChars + symbolChars;

    const generateRandomPassword = (length) => {
      let password = "";
      for (let i = 0; i < length; i++) {
        password += allChars.charAt(
          Math.floor(Math.random() * allChars.length),
        );
      }
      return password;
    };

    const isValidPassword = (password) => {
      return validator.isStrongPassword(password, {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      });
    };

    let password = generateRandomPassword(12);
    while (!isValidPassword(password)) {
      password = generateRandomPassword(12);
    }
    return password;
  };

  const getCompanyCodeAndTokenFromCookies = () => {
    const cookies = document.cookie.split("; ");
    const companyCookie = cookies.find((cookie) =>
      cookie.startsWith("companyCode="),
    );
    const companyCode = companyCookie ? companyCookie.split("=")[1] : null;
    return { companyCode };
  };

  const getEmployeeId = async () => {
    try {
      const { companyCode } = getCompanyCodeAndTokenFromCookies();
      if (!companyCode) {
        setShowPopup(true);
        setMessage("Company code not found. Please ensure you are logged in.");
        setTimeout(() => setShowPopup(false), 3000);
        return;
      }
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/company/${companyCode}/generate-employee-id`,
        {
          withCredentials: true,
        },
      );
      const newId = response.data?.new_id || "";
      if (!newId) {
        console.error("Employee ID not found in response:", response.data);
        setShowPopup(true);
        setMessage("Failed to retrieve Employee ID.");
        setTimeout(() => setShowPopup(false), 3000);
        return;
      }
      console.log("New Employee ID:", newId);

      setEmployeeId(newId);
      setData((prevData) => ({
        ...prevData,
        data: {
          ...prevData.data,
          employee_id: newId,
        },
      }));
    } catch (error) {
      console.error("Error fetching employee ID:", error);
    }
  };
  const checkEmployeeIdAvailability = async () => {
    setCheckingId(true);
    setCheckIdMessage("");

    try {
      const { companyCode } = getCompanyCodeAndTokenFromCookies();

      const empIdToCheck =
        mode === "create" ? data?.data?.employee_id : employee?.employee_id;

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/company/${companyCode}/check-employee-id/${empIdToCheck}`,
      );

      const exists = response.data.exists;

      if (exists) {
        setCheckIdMessage("❌ Try another ID, already exists.");
      } else {
        setCheckIdMessage("✅ Done! ID is available.");
      }
    } catch (error) {
      console.error("Error checking employee ID:", error);
      setCheckIdMessage("⚠️ Error checking ID. Try again.");
    }

    setCheckingId(false);
  };

  useEffect(() => {
    const fetchLeaveTemplates = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/leave_template/get_all_leave_templates`,
        );
        console.log("leavetemplates ;:::::", response.data.data);

        setLeaveTemplates(response.data.data || []);
      } catch (error) {
        console.error("Error fetching leave templates:", error);
      }
    };

    fetchLeaveTemplates();
  }, []);

  useEffect(() => {
    getEmployeeId();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/collection-category/get-categories`,
        );
        console.log("response", response.data);
        setCategoryData(response.data);
      } catch (err) {
        console.log(err);
      }
    })();
  }, []);

  console.log("categoryData", categoryData);

  useEffect(() => {
    (async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/weekly-holidays/get-rules`,
        );
        setWeeklyholidays(response.data);
      } catch (err) {
        console.log(err);
      }
    })();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();

    try {
      const { companyCode } = getCompanyCodeAndTokenFromCookies();
      if (!companyCode) {
        setShowPopup(true);
        setMessage("Company code not found. Please ensure you are logged in.");
        setTimeout(() => setShowPopup(false), 3000);
        return;
      }

      const password = generatePassword();

      // Destructure bank and PF/ESI fields from data.data
      const {
        account_number,
        bank_name,
        ifsc_code,
        branch_name,
        esi_number,
        pf_number,
        entitled_to_eps,
        restricted_basic_for_pf_calculation,
        ...restData
      } = data.data;

      // Build the payload with nested account_details.bank_details
      const dataWithPassword = {
        ...data,
        data: {
          ...restData,
          password,
          weekly_holiday_rule: data.data.weekly_holiday_rule,
          weekly_holiday_rule_name: data.data.weekly_holiday_rule_name,
          account_details: {
            bank_details: {
              account_number,
              bank_name,
              ifsc_code,
              branch_name,
            },
            esi_number,
            pf_number,
            entitled_to_eps,
            restricted_basic_for_pf_calculation,
          },
        },
      };

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/company/${companyCode}/create-employee`,
        dataWithPassword,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (response.status === 201) {
        setShowPopup(true);
        setMessage("User created successfully!");
        setTimeout(() => {
          setShowPopup(false);
          navigate("/dashboard/users");
        }, 3000);

        // Reset form
        setData((prev) => ({
          ...prev,
          data: {
            employee_id: "",
            employee_type: "",
            group_id: null,
            name: "",
            gender: "",
            contact: "",
            email: "",
            password: "",
            pan: "",
            aadharcard: "",
            personal_email: "",
            date_of_birth: "",
            job_roles: [],
            current_address: {
              state: "",
              city: "",
              landmark: "",
              pin_code: "",
              address_line_1: "",
              address_line_2: "",
            },
            permanent_address: {
              state: "",
              city: "",
              landmark: "",
              pin_code: "",
              address_line_1: "",
              address_line_2: "",
            },
            marital_status: "",
            passport: "",
            father_name: "",
            mother_name: "",
            blood_group: "",
            role: "",
            designation: "",
            department: "",
            reporting_manager: "",
            direct_reportees: [
              {
                reportees_id: "",
                reportees_name: "",
              },
            ],
            joining_date: "",
            employee_status: "",
            payroll_type: "",
            insurance_number: "",
            insurance_company: "",
            ins_start_date: "",
            ins_end_date: "",
          },
        }));
      } else {
        setShowPopup(true);
        setMessage("Failed to create user.");
        setTimeout(() => setShowPopup(false), 3000);
      }
    } catch (error) {
      console.error("Error creating user:", error);

      const errors = error?.response?.data?.errors;
      const message = error?.response?.data?.message;

      let finalErrorMessage = "An error occurred while creating the user.";

      if (Array.isArray(errors) && errors.length > 0) {
        finalErrorMessage += " " + errors.join(" ");
      } else if (message) {
        finalErrorMessage += ` ${message}`;
      } else {
        finalErrorMessage += ` ${error.message}`;
      }

      setShowPopup(true);
      setMessage(finalErrorMessage);
      setTimeout(() => setShowPopup(false), 4000);
    }
  };

  const editUser = async (employee_id, e) => {
    try {
      e.preventDefault();

      const { companyCode } = getCompanyCodeAndTokenFromCookies();
      if (!companyCode) {
        setShowPopup(true);
        setMessage("Company code not found. Please ensure you are logged in.");
        setTimeout(() => setShowPopup(false), 3000);
        return;
      }

      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("authToken="))
        ?.split("=")[1];

      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/company/${companyCode}/edit-employee/${employee_id}`,
        employee,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.status === 200) {
        setShowPopup(true);
        setMessage("Employee data updated successfully");
        setTimeout(() => {
          setShowPopup(false);
          navigate("/dashboard/users");
        }, 3000);
      } else {
        setShowPopup(true);
        setMessage("Failed to update employee.");
        setTimeout(() => setShowPopup(false), 3000);
      }
    } catch (error) {
      console.error("Error updating employee data:", error);

      let errorMsg = "An error occurred while updating the user.";

      // If backend returned an 'errors' array, join and show it
      if (error?.response?.data?.errors?.length > 0) {
        errorMsg += " " + error.response.data.errors.join(" ");
      } else if (error?.response?.data?.message) {
        errorMsg += " " + error.response.data.message;
      } else if (error.message) {
        errorMsg += " " + error.message;
      }

      setShowPopup(true);
      setMessage(errorMsg);
      setTimeout(() => setShowPopup(false), 3000);
    }
  };

  // Check if all required fields in a section are filled
  const isSectionValid = (sectionKey) => {
    const fields = requiredFields[sectionKey];
    if (!fields) return true;
    if (mode === "create") {
      return fields.every((field) => {
        if (
          sectionKey === "current_address" ||
          sectionKey === "permanent_address"
        ) {
          return !!data.data[sectionKey][field];
        }
        return !!data.data[field];
      });
    } else if (mode === "edit" || mode === "readonly") {
      // For edit/readonly, check in employee object
      if (
        sectionKey === "current_address" ||
        sectionKey === "permanent_address"
      ) {
        return fields.every((field) => !!employee?.[sectionKey]?.[field]);
      }
      if (sectionKey === "bank_details") {
        return fields.every(
          (field) => !!employee?.account_details?.bank_details?.[field],
        );
      }
      if (sectionKey === "pf_details") {
        return fields.every((field) => !!employee?.account_details?.[field]);
      }
      if (sectionKey === "insurance_details") {
        return fields.every((field) => !!employee?.insurance_details?.[field]);
      }
      if (sectionKey === "other_details" || sectionKey === "personal_details") {
        return fields.every((field) => !!employee?.[sectionKey]?.[field]);
      }
      if (sectionKey === "official_details") {
        return fields.every(
          (field) =>
            !!employee?.official_details?.[field] || !!employee?.[field],
        );
      }
      if (sectionKey === "employee_details") {
        return fields.every((field) => !!employee?.employee_details?.[field]);
      }
      return fields.every((field) => !!employee?.[field]);
    }
    return true;
  };

  const updateSectionValidity = (index, isValid) => {
    setSectionValidity((prev) => ({ ...prev, [index]: isValid }));
    //  setSectionValidityArray((prev) => ({ ...prev, [index]: isValid }));
  };

  const handleNext = () => {
    if (currentSection < section.length - 1) {
      const nextSection = currentSection + 1;
      setCurrentSection(nextSection);
      setCheckedSections((prev) =>
        prev.includes(nextSection) ? prev : [...prev, nextSection],
      );
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCheckedSections((prev) => {
        const updatedSections = [...prev];
        updatedSections.pop();
        return updatedSections;
      });
      setCurrentSection((prev) => prev - 1);
    }
  };

  const sections = [
    {
      title: "Employee Details",
      content: (
        <div className="employee-details-form">
          <h2>Employee Details</h2>

          <div className="user_section_row">
            <div className="input_group">
              <label>
                Name <span className="highlighted_star">*</span>
              </label>
              {mode === "edit" || mode === "create" ? (
                <input
                  type="text"
                  name="name"
                  value={
                    mode === "create"
                      ? data?.data?.name
                      : employee?.employee_details?.name || ""
                  }
                  onChange={handleChange}
                />
              ) : (
                <input
                  value={employee?.employee_details?.name || ""}
                  readOnly
                />
              )}
            </div>

            <div className="input_group">
              <label>
                Gender <span className="highlighted_star">*</span>
              </label>
              {mode === "edit" || mode === "create" ? (
                <select
                  name="gender"
                  value={
                    mode === "create"
                      ? data?.data?.gender
                      : employee?.employee_details?.gender || ""
                  }
                  onChange={handleChange}
                >
                  <option value="">Select...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              ) : (
                <input
                  value={employee?.employee_details?.gender || ""}
                  readOnly
                />
              )}
            </div>
          </div>
          <div className="user_section_row">
            <div className="input_group">
              <label>
                Contact <span className="highlighted_star">*</span>
              </label>
              {mode === "edit" || mode === "create" ? (
                <input
                  type="number"
                  name="contact"
                  value={
                    mode === "create"
                      ? data?.data?.contact
                      : employee?.employee_details?.contact || ""
                  }
                  onChange={handleChange}
                />
              ) : (
                <input
                  value={employee?.employee_details?.contact || ""}
                  readOnly
                />
              )}
            </div>

            <div className="input_group">
              <label>
                Official Email <span className="highlighted_star">*</span>
              </label>
              {mode === "edit" || mode === "create" ? (
                <input
                  type="email"
                  name="email"
                  value={
                    mode === "create"
                      ? data?.data?.email
                      : employee?.employee_details?.email || ""
                  }
                  onChange={handleChange}
                  required
                />
              ) : (
                <input
                  value={employee?.employee_details?.email || ""}
                  readOnly
                />
              )}
            </div>
          </div>
          <div className="user_section_row">
            <div className="input_group">
              <label>
                Employee Id <span className="highlighted_star">*</span>
              </label>
              <div
                style={{ display: "flex", gap: "10px", alignItems: "center" }}
              >
                {/* {mode === "edit" || mode === "create" ? (
                  <input
                    type="text"
                    name="employee_id"
                    value={employeeId}
                    readOnly
                  />
                ) : (
                  <input value={employee?.employee_id || ""} readOnly />
                )} */}
                <input
                  type="text"
                  name="employee_id"
                  value={
                    mode === "create"
                      ? data?.data?.employee_id
                      : employee?.employee_id
                  }
                  onChange={(e) => {
                    if (mode === "create") {
                      setData((prev) => ({
                        ...prev,
                        data: {
                          ...prev.data,
                          employee_id: e.target.value,
                        },
                      }));
                    } else if (mode === "edit") {
                      setEmployee((prev) => ({
                        ...prev,
                        employee_id: e.target.value,
                      }));
                    }
                  }}
                />

                <button
                  type="button"
                  onClick={checkEmployeeIdAvailability}
                  disabled={checkingId}
                  className="btn-check-id"
                >
                  {checkingId ? "Checking..." : "Check"}
                </button>
              </div>
              {checkIdMessage && (
                <p
                  style={{
                    marginTop: "4px",
                    color: checkIdMessage.includes("✅") ? "green" : "red",
                  }}
                >
                  {checkIdMessage}
                </p>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Official Details",
      content: (
        <div className="employee-details-form">
          <h2>Official Details</h2>
          <div className="user_section_row">
            <div className="input_group">
              <label>Department </label>
              {mode === "edit" || mode === "create" ? (
                <select
                  name="department"
                  value={
                    mode === "create"
                      ? data?.data?.department
                      : employee?.official_details?.department || ""
                  }
                  onChange={handleChange}
                  required
                >
                  <option value={""}>Select...</option>
                  {categoryData.map(
                    (category) =>
                      category.name === "department" &&
                      category.options.length > 0 &&
                      category.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      )),
                  )}
                </select>
              ) : (
                <input
                  value={employee?.official_details?.department || ""}
                  readOnly
                />
              )}
            </div>

            <div className="input_group relative">
              <label>
                Designation<span className="highlighted_star">*</span>{" "}
              </label>
              {mode === "edit" || mode === "create" ? (
                <select
                  name="designation"
                  value={
                    mode === "create"
                      ? data?.data?.designation
                      : employee?.official_details?.designation || ""
                  }
                  onChange={handleChange}
                  required
                >
                  <option value={""}>Select...</option>
                  {categoryData.map(
                    (category) =>
                      category.name === "designation" &&
                      category.options.length > 0 &&
                      category.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      )),
                  )}
                </select>
              ) : (
                <input
                  value={employee?.official_details?.designation || ""}
                  readOnly
                />
              )}
            </div>
          </div>
          <div className="user_section_row">
            <div className="input_group">
              <label>
                Employee Status <span className="highlighted_star">*</span>
              </label>
              {mode === "edit" || mode === "create" ? (
                <select
                  name="employee_status"
                  value={
                    mode === "create"
                      ? data?.data?.employee_status
                      : employee?.official_details?.employee_status || ""
                  }
                  onChange={handleChange}
                >
                  <option value="">Select...</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Dummy">Dummy</option>
                </select>
              ) : (
                <input
                  value={employee?.official_details?.employee_status || ""}
                  readOnly
                />
              )}
            </div>

            <div className="input_group">
              <label>Role</label>
              {mode === "edit" || mode === "create" ? (
                <select
                  name="role"
                  value={
                    mode === "create"
                      ? data?.data?.role
                      : employee?.official_details?.role || ""
                  }
                  onChange={handleChange}
                  required
                >
                  <option value={""}>Select...</option>
                  {categoryData.map(
                    (category) =>
                      category.name === "role" &&
                      category.options.length > 0 &&
                      category.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      )),
                  )}
                </select>
              ) : (
                <input
                  value={employee?.official_details?.role || ""}
                  readOnly
                />
              )}
            </div>
          </div>
          <div className="user_section_row">
            <div className="input_group">
              <label>
                Reporting Manager <span className="highlighted_star">*</span>
              </label>
              {mode === "edit" || mode === "create" ? (
                <select
                  name="reporting_manager"
                  value={
                    mode === "create"
                      ? data?.data?.reporting_manager
                      : employee?.official_details?.reporting_manager || ""
                  }
                  onChange={handleChange}
                  required
                >
                  <option value={""}>Select...</option>
                  {categoryData.map(
                    (category) =>
                      category.name === "reportingmanager" &&
                      category.options.length > 0 &&
                      category.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      )),
                  )}
                </select>
              ) : (
                <input
                  value={employee?.official_details?.reporting_manager || ""}
                  readOnly
                />
              )}
            </div>

            <div className="input_group">
              <label>
                Employee Type <span className="highlighted_star">*</span>
              </label>
              {mode === "edit" || mode === "create" ? (
                <select
                  name="employee_type"
                  value={
                    mode === "create"
                      ? data?.data?.employee_type
                      : employee?.employee_type || ""
                  }
                  onChange={handleChange}
                >
                  <option value="">Select...</option>
                  <option value="In Company">In Company</option>
                  <option value="On Field">On Field</option>
                </select>
              ) : (
                <input value={employee?.employee_type || ""} readOnly />
              )}
            </div>
          </div>
          <div className="user_section_row">
            <div className="input_group">
              <label>
                Job Role <span className="highlighted_star">*</span>
              </label>
              {mode === "edit" || mode === "create" ? (
                <select
                  name="job_roles"
                  value={
                    mode === "create"
                      ? data?.data?.job_roles
                      : employee?.job_roles[0] || ""
                  }
                  onChange={handleChange}
                  required
                >
                  <option value={""}>Select...</option>
                  {categoryData.map(
                    (category) =>
                      category.name === "jobrole" &&
                      category.options.length > 0 &&
                      category.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      )),
                  )}
                </select>
              ) : (
                <input value={employee?.job_roles?.[0] || ""} readOnly />
              )}
            </div>
            <div className="input_group">
              <label>
                Weekly Holiday Rule <span className="highlighted_star">*</span>
              </label>
              {mode === "edit" || mode === "create" ? (
                <select
                  name="weekly_holiday_rule"
                  value={
                    mode === "create"
                      ? data?.data?.weekly_holiday_rule
                      : employee?.official_details?.weekly_holiday_rule_id // Use ID in edit mode if available
                  }
                  onChange={handleChange}
                  required
                >
                  <option value={""}>Select...</option>
                  {weeklyholidays.length > 0 &&
                    weeklyholidays.map((rule) => (
                      <option key={rule._id} value={rule._id}>
                        {rule.weekDay_name || rule.ruleName}
                      </option>
                    ))}
                </select>
              ) : (
                <input
                  value={employee?.weekly_off_rule_name || ""} // Display value in read-only mode
                  readOnly
                />
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Personal Details",
      content: (
        <div className="employee-details-form">
          <h2>Personal Details</h2>

          <div className="user_section_row">
            <div className="input_group">
              <label>
                Pan Card<span className="highlighted_star">*</span>
              </label>
              {mode === "edit" || mode === "create" ? (
                <input
                  type="text"
                  name="pan"
                  value={
                    mode === "create"
                      ? data?.data?.pan
                      : employee?.personal_details?.pan || ""
                  }
                  onChange={handleChange}
                />
              ) : (
                <input value={employee?.personal_details?.pan || ""} readOnly />
              )}
            </div>

            <div className="input_group">
              <label>
                Aadhar Card<span className="highlighted_star">*</span>
              </label>
              {mode === "edit" || mode === "create" ? (
                <input
                  type="number"
                  name="aadharcard"
                  value={
                    mode === "create"
                      ? data?.data?.aadharcard
                      : employee?.personal_details?.aadharcard || ""
                  }
                  onChange={handleChange}
                />
              ) : (
                <input
                  value={employee?.personal_details?.aadharcard || ""}
                  readOnly
                />
              )}
            </div>
          </div>
          <div className="user_section_row">
            <div className="input_group">
              <label>Personal Email</label>
              {mode === "edit" || mode === "create" ? (
                <input
                  type="text"
                  name="personal_email"
                  value={
                    mode === "create"
                      ? data?.data?.personal_email
                      : employee?.personal_details?.personal_email || ""
                  }
                  onChange={handleChange}
                />
              ) : (
                <input
                  value={employee?.personal_details?.personal_email || ""}
                  readOnly
                />
              )}
            </div>

            <div className="input_group">
              <label>
                DOB <span className="highlighted_star">*</span>
              </label>
              {mode === "edit" || mode === "create" ? (
                <input
                  type="date"
                  name="date_of_birth"
                  value={
                    mode === "create"
                      ? data?.data?.date_of_birth?.split("T")[0]
                      : employee?.personal_details?.date_of_birth?.split("T")[0]
                  }
                  onChange={handleChange}
                />
              ) : (
                <input
                  value={
                    employee?.personal_details?.date_of_birth?.split("T")[0] ||
                    ""
                  }
                  readOnly
                />
              )}
            </div>
          </div>
          <div className="user_section_row">
            <div className="input_group">
              <label>
                Joining Date <span className="highlighted_star">*</span>
              </label>
              {mode === "edit" || mode === "create" ? (
                <input
                  type="date"
                  name="joining_date"
                  form
                  value={
                    mode === "create"
                      ? data?.data?.joining_date?.split("T")[0]
                      : employee?.joining_date?.split("T")[0] || ""
                  }
                  onChange={handleChange}
                />
              ) : (
                <input value={employee?.joining_date?.split("T")[0]} readOnly />
              )}
            </div>

            <div className="input_group">
              <label>Leave Template</label>
              <select
                name="leave_template"
                value={
                  mode === "create"
                    ? data?.data?.leave_template || ""
                    : employee?.official_details?.leave_template || ""
                }
                onChange={handleChange}
                required
                disabled={mode === "view"} // disable only in view mode
              >
                <option value="">Select...</option>
                {leaveTemplates.map((template) => (
                  <option key={template._id} value={template._id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Other Details",
      content: (
        <div className="employee-details-form">
          <h2>Other Details</h2>

          <div className="user_section_row">
            <div className="input_group">
              <label>Passport</label>
              {mode === "edit" || mode === "create" ? (
                <input
                  type="text"
                  name="passport"
                  value={
                    mode === "create"
                      ? data?.data?.passport
                      : employee?.other_details?.passport || ""
                  }
                  onChange={handleChange}
                />
              ) : (
                <input
                  value={employee?.other_details?.passport || ""}
                  readOnly
                />
              )}
            </div>

            <div className="input_group">
              <label>
                Marital Status <span className="highlighted_star">*</span>
              </label>
              {mode === "edit" || mode === "create" ? (
                <select
                  name="marital_status"
                  value={
                    mode === "create"
                      ? data?.data?.marital_status
                      : employee?.other_details?.marital_status || ""
                  }
                  onChange={handleChange}
                >
                  <option value="">Select...</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                </select>
              ) : (
                <input
                  value={employee?.other_details?.marital_status || ""}
                  readOnly
                />
              )}
            </div>
          </div>

          <div className="user_section_row">
            <div className="input_group">
              <label>Father Name</label>
              {mode === "edit" || mode === "create" ? (
                <input
                  type="text"
                  name="father_name"
                  value={
                    mode === "create"
                      ? data?.data?.father_name
                      : employee?.other_details?.father_name || ""
                  }
                  onChange={handleChange}
                />
              ) : (
                <input
                  value={employee?.other_details?.father_name || ""}
                  readOnly
                />
              )}
            </div>

            <div className="input_group">
              <label>Mother Name</label>
              {mode === "edit" || mode === "create" ? (
                <input
                  type="text"
                  name="mother_name"
                  value={
                    mode === "create"
                      ? data?.data?.mother_name
                      : employee?.other_details?.mother_name || ""
                  }
                  onChange={handleChange}
                />
              ) : (
                <input
                  value={employee?.other_details?.mother_name || ""}
                  readOnly
                />
              )}
            </div>
          </div>
          <div className="input_group">
            <label>Blood Group</label>
            {mode === "edit" || mode === "create" ? (
              <input
                type="text"
                name="blood_group"
                value={
                  mode === "create"
                    ? data?.data?.blood_group
                    : employee?.other_details?.blood_group || ""
                }
                onChange={handleChange}
              />
            ) : (
              <input
                value={employee?.other_details?.blood_group || ""}
                readOnly
              />
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Bank Details",
      content: (
        <div className="employee-details-form">
          <h2>Bank Details</h2>

          <div className="user_section_row">
            <div className="input_group">
              <label>
                Account Number <span className="highlighted_star">*</span>
              </label>
              {mode === "edit" || mode === "create" ? (
                <input
                  type="text"
                  name="account_number"
                  value={
                    mode === "create"
                      ? data?.data?.account_number
                      : employee?.account_details?.bank_details
                          ?.account_number || "" // FIXED: Added optional chaining here
                  }
                  onChange={handleChange}
                />
              ) : (
                <input
                  value={
                    employee?.account_details?.bank_details?.account_number ||
                    "" // Added || "" for consistency
                  }
                  readOnly
                />
              )}
            </div>

            <div className="input_group">
              <label>Bank Name </label>
              {mode === "edit" || mode === "create" ? (
                <input
                  type="text"
                  name="bank_name"
                  value={
                    mode === "create"
                      ? data.data.bank_name
                      : employee?.account_details?.bank_details?.bank_name || "" // FIXED: Added optional chaining here
                  }
                  onChange={handleChange}
                />
              ) : (
                <input
                  value={
                    employee?.account_details?.bank_details?.bank_name || ""
                  } // Added || "" for consistency
                  readOnly
                />
              )}
            </div>
          </div>
          <div className="user_section_row">
            <div className="input_group">
              <label>
                IFSC Code <span className="highlighted_star">*</span>
              </label>
              {mode === "edit" || mode === "create" ? (
                <input
                  type="text"
                  name="ifsc_code"
                  value={
                    mode === "create"
                      ? data.data.ifsc_code
                      : employee?.account_details?.bank_details?.ifsc_code || "" // FIXED: Added optional chaining here
                  }
                  onChange={handleChange}
                  required
                />
              ) : (
                <input
                  value={
                    employee?.account_details?.bank_details?.ifsc_code || ""
                  } // Added || "" for consistency
                  readOnly
                />
              )}
            </div>

            <div className="input_group">
              <label>Branch Name </label>
              {mode === "edit" || mode === "create" ? (
                <input
                  type="text"
                  name="branch_name"
                  value={
                    mode === "create"
                      ? data.data.branch_name
                      : employee?.account_details?.bank_details?.branch_name ||
                        "" // FIXED: Added optional chaining here
                  }
                  onChange={handleChange}
                />
              ) : (
                <input
                  value={
                    employee?.account_details?.bank_details?.branch_name || ""
                  } // Added || "" for consistency
                  readOnly
                />
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Insurance Details",
      content: (
        <div className="employee-details-form">
          <h2>Insurance Details</h2>

          <div className="user_section_row">
            <div className="input_group">
              <label>Insurance Number </label>
              {mode === "edit" || mode === "create" ? (
                <input
                  type="text"
                  name="insurance_number"
                  value={
                    mode === "create"
                      ? data.data.insurance_number
                      : employee?.insurance_details?.insurance_number || ""
                  }
                  onChange={handleChange}
                />
              ) : (
                <input
                  value={employee?.insurance_details?.insurance_number || ""}
                  readOnly
                />
              )}
            </div>

            <div className="input_group">
              <label>Insurance Company </label>
              {mode === "edit" || mode === "create" ? (
                <input
                  type="text"
                  name="insurance_company"
                  value={
                    mode === "create"
                      ? data.data.insurance_company
                      : employee?.insurance_details?.insurance_company || ""
                  }
                  onChange={handleChange}
                />
              ) : (
                <input
                  value={employee?.insurance_details?.insurance_company || ""}
                  readOnly
                />
              )}
            </div>
          </div>

          <div className="user_section_row">
            <div className="input_group">
              <label>INS Start Date </label>
              {mode === "edit" || mode === "create" ? (
                <input
                  type="date"
                  name="ins_start_date"
                  value={
                    mode === "create"
                      ? data.data.ins_start_date?.split("T")[0]
                      : employee?.insurance_details?.ins_start_date?.split(
                          "T",
                        )[0] || ""
                  }
                  onChange={handleChange}
                />
              ) : (
                <input
                  value={
                    employee?.insurance_details?.ins_start_date?.split(
                      "T",
                    )[0] || ""
                  }
                  readOnly
                />
              )}
            </div>

            <div className="input_group">
              <label>INS End Date </label>
              {mode === "edit" || mode === "create" ? (
                <input
                  type="date"
                  name="ins_end_date"
                  value={
                    mode === "create"
                      ? data.data.ins_end_date?.split("T")[0]
                      : employee?.insurance_details?.ins_end_date?.split(
                          "T",
                        )[0] || ""
                  }
                  onChange={handleChange}
                />
              ) : (
                <input
                  value={
                    employee?.insurance_details?.ins_end_date?.split("T")[0] ||
                    ""
                  }
                  readOnly
                />
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "PF Details",
      content: (
        <div className="employee-details-form">
          <h2>PF Details</h2>

          <div className="user_section_row">
            <div className="input_group">
              <label>ESI Number </label>
              {mode === "edit" || mode === "create" ? (
                <input
                  type="text"
                  name="esi_number"
                  value={
                    mode === "create"
                      ? data.data.esi_number || ""
                      : employee?.account_details?.esi_number || ""
                  }
                  onChange={handleChange}
                />
              ) : (
                <input
                  value={employee?.account_details?.esi_number || ""}
                  readOnly
                />
              )}
            </div>

            <div className="input_group">
              <label>PF Number </label>
              {mode === "edit" || mode === "create" ? (
                <input
                  type="text"
                  name="pf_number"
                  value={
                    mode === "create"
                      ? data.data.pf_number || ""
                      : employee?.account_details?.pf_number || ""
                  }
                  onChange={handleChange}
                />
              ) : (
                <input
                  value={employee?.account_details?.pf_number || ""}
                  readOnly
                />
              )}
            </div>
          </div>
          <div className="user_section_row_checkBox">
            <div className="input_group_lable">
              <label>Entitled To EPS</label>

              <input
                type="checkbox"
                name="entitled_to_eps"
                checked={
                  mode === "create"
                    ? data.data.entitled_to_eps
                    : employee?.account_details?.entitled_to_eps || false
                }
                onChange={(e) =>
                  handleChange({
                    target: {
                      name: "entitled_to_eps",
                      value: e.target.checked,
                      type: "checkbox",
                      checked: e.target.checked,
                    },
                  })
                }
              />
            </div>

            <div className="input_group_lable">
              <label>Restricted Basic For PF Calculation</label>

              <input
                type="checkbox"
                name="restricted_basic_for_pf_calculation"
                checked={
                  mode === "create"
                    ? data.data.restricted_basic_for_pf_calculation
                    : employee?.account_details
                        ?.restricted_basic_for_pf_calculation || false
                }
                onChange={(e) =>
                  handleChange({
                    target: {
                      name: "restricted_basic_for_pf_calculation",
                      value: e.target.checked,
                      type: "checkbox",
                      checked: e.target.checked,
                    },
                  })
                }
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Current Address",
      content: (
        <div className="employee-details-form">
          <h2>Current Address</h2>

          <div className="user_section_row">
            <div className="input_group">
              <label>Address Line 1 </label>
              {mode === "edit" || mode === "create" ? (
                <input
                  type="text"
                  name="address_line_1"
                  value={
                    mode === "create"
                      ? data.data.current_address.address_line_1 || ""
                      : employee?.current_address?.address_line_1 || ""
                  }
                  onChange={handleChange}
                />
              ) : (
                <input
                  value={employee?.current_address?.address_line_1 || ""}
                  readOnly
                />
              )}
            </div>

            <div className="input_group">
              <label>Address Line 2 </label>
              {mode === "edit" || mode === "create" ? (
                <input
                  type="text"
                  name="address_line_2"
                  value={
                    mode === "create"
                      ? data.data.current_address.address_line_2 || ""
                      : employee?.current_address?.address_line_2 || ""
                  }
                  onChange={handleChange}
                />
              ) : (
                <input
                  value={employee?.current_address?.address_line_2 || ""}
                  readOnly
                />
              )}
            </div>
          </div>
          <div className="user_section_row">
            <div className="input_group">
              <label>Landmark </label>
              {mode === "edit" || mode === "create" ? (
                <input
                  type="text"
                  name="landmark"
                  value={
                    mode === "create"
                      ? data.data.current_address.landmark || ""
                      : employee?.current_address?.landmark || ""
                  }
                  onChange={handleChange}
                />
              ) : (
                <input
                  value={employee?.current_address?.landmark || ""}
                  readOnly
                />
              )}
            </div>
            <div className="input_group">
              <label>City </label>
              {mode === "edit" || mode === "create" ? (
                <input
                  type="text"
                  name="city"
                  value={
                    mode === "create"
                      ? data?.data?.current_address?.city || ""
                      : employee?.current_address?.city || ""
                  }
                  onChange={handleChange}
                />
              ) : (
                <input value={employee?.current_address?.city || ""} readOnly />
              )}
            </div>
          </div>
          <div className="user_section_row">
            <div className="input_group">
              <label>Pincode </label>
              {mode === "edit" || mode === "create" ? (
                <input
                  type="number"
                  name="pin_code"
                  value={
                    mode === "create"
                      ? data.data.current_address.pin_code || ""
                      : employee?.current_address?.pin_code || ""
                  }
                  onChange={handleChange}
                />
              ) : (
                <input
                  value={employee?.current_address?.pin_code || ""}
                  readOnly
                />
              )}
            </div>

            <div className="input_group">
              <label>State </label>
              {mode === "edit" || mode === "create" ? (
                <input
                  type="text"
                  name="state"
                  value={
                    mode === "create"
                      ? data.data.current_address.state || ""
                      : employee?.current_address?.state || ""
                  }
                  onChange={handleChange}
                />
              ) : (
                <input
                  value={employee?.current_address?.state || ""}
                  readOnly
                />
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Permanent Address",
      content: (
        <div className="employee-details-form">
          <h2>Permanent Address</h2>

          <div className="user_section_row">
            <div className="input_group">
              <label>Address Line 1 </label>
              {mode === "edit" || mode === "create" ? (
                <input
                  type="text"
                  name="address_line_1"
                  value={
                    mode === "create"
                      ? data.data.permanent_address.address_line_1 || ""
                      : employee?.permanent_address?.address_line_1 || ""
                  }
                  onChange={handleChange}
                />
              ) : (
                <input
                  value={employee?.permanent_address?.address_line_1 || ""}
                  readOnly
                />
              )}
            </div>

            <div className="input_group">
              <label>Address Line 2 </label>
              {mode === "edit" || mode === "create" ? (
                <input
                  type="text"
                  name="address_line_2"
                  value={
                    mode === "create"
                      ? data.data.permanent_address.address_line_2 || ""
                      : employee?.permanent_address?.address_line_2 || ""
                  }
                  onChange={handleChange}
                />
              ) : (
                <input
                  value={employee?.permanent_address?.address_line_2 || ""}
                  readOnly
                />
              )}
            </div>
          </div>
          <div className="user_section_row">
            <div className="input_group">
              <label>Landmark </label>
              {mode === "edit" || mode === "create" ? (
                <input
                  type="text"
                  name="landmark"
                  value={
                    mode === "create"
                      ? data.data.permanent_address.landmark || ""
                      : employee?.permanent_address?.landmark || ""
                  }
                  onChange={handleChange}
                />
              ) : (
                <input
                  value={employee?.permanent_address?.landmark || ""}
                  readOnly
                />
              )}
            </div>
            <div className="input_group">
              <label>City </label>
              {mode === "edit" || mode === "create" ? (
                <input
                  type="text"
                  name="city"
                  value={
                    mode === "create"
                      ? data?.data?.permanent_address?.city || ""
                      : employee?.permanent_address?.city || ""
                  }
                  onChange={handleChange}
                />
              ) : (
                <input
                  value={employee?.permanent_address?.city || ""}
                  readOnly
                />
              )}
            </div>
          </div>
          <div className="user_section_row">
            <div className="input_group">
              <label>Pincode </label>
              {mode === "edit" || mode === "create" ? (
                <input
                  type="number"
                  name="pin_code"
                  value={
                    mode === "create"
                      ? data.data.permanent_address.pin_code || ""
                      : employee?.permanent_address?.pin_code || ""
                  }
                  onChange={handleChange}
                />
              ) : (
                <input
                  value={employee?.permanent_address?.pin_code || ""}
                  readOnly
                />
              )}
            </div>

            <div className="input_group">
              <label>State </label>
              {mode === "edit" || mode === "create" ? (
                <input
                  type="text"
                  name="state"
                  value={
                    mode === "create"
                      ? data.data.permanent_address.state || ""
                      : employee?.permanent_address?.state || ""
                  }
                  onChange={handleChange}
                />
              ) : (
                <input
                  value={employee?.permanent_address?.state || ""}
                  readOnly
                />
              )}
            </div>
          </div>
        </div>
      ),
    },
  ];

  const handleCheckboxChange = (sectionIndex) => {
    setCurrentSection(sectionIndex);
    setCheckedSections((prev) =>
      prev.includes(sectionIndex) ? prev : [...prev, sectionIndex],
    );
  };

  // Add refs for each section
  const sectionRefs = useRef(section.map(() => React.createRef()));

  // Scroll to section in readonly mode
  const handleLabelClick = (sectionId) => {
    if (mode === "readonly" && sectionRefs.current[sectionId]?.current) {
      sectionRefs.current[sectionId].current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    } else if (mode !== "readonly") {
      handleCheckboxChange(sectionId);
    }
  };

  return (
    <div>
      <div className="back_button_navigate" onClick={() => navigate(-1)}>
        <button>
          <IoArrowBackOutline />
        </button>
      </div>
      <div className="user-tracket-main">
        <div className="new-user-tracker-details">
          <div className="new-user-tracker-data">
            <ul>
              {section.map((section) => (
                <li key={section.id}>
                  <input
                    type="radio"
                    checked={
                      mode === "readonly"
                        ? true
                        : checkedSections.includes(section.id)
                    }
                    onChange={() => handleCheckboxChange(section.id)}
                    className={`new-user-input-radio 
                      ${
                        isSectionValid(sectionKeys[section.id])
                          ? "border_green"
                          : "border_red"
                      }
                    `}
                    id={`option${section.id + 1}`}
                    // disabled={mode === "readonly"}
                  />
                  <label
                    className="new-user-lable-details"
                    htmlFor={`option${section.id + 1}`}
                    onClick={() => handleLabelClick(section.id)}
                    style={mode === "readonly" ? { cursor: "pointer" } : {}}
                  >
                    {section.label}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Render all sections in scrollable view if readonly */}
        {mode === "readonly" ? (
          <form className="employee-form scrollable-form">
            {sections.map((sec, idx) => (
              <div
                key={idx}
                className="readonly-section"
                ref={sectionRefs.current[idx]}
              >
                {sec.content}
              </div>
            ))}
          </form>
        ) : (
          // Stepper/Next-Previous for create/edit
          <form className="employee-form">
            {sections[currentSection].content}
            <div className="navigation-buttons">
              <Button
                text="Previous"
                onClick={handlePrevious}
                disabled={currentSection === 0}
              ></Button>
              {currentSection < sections.length - 1 && (
                <Button text="Next" onClick={handleNext}></Button>
              )}
              {mode === "create" && currentSection === sections.length - 1 && (
                <button type="submit" onClick={handleCreateUser}>
                  Create
                </button>
              )}
              {mode === "edit" && currentSection === sections.length - 1 && (
                <Button
                  text="Update & Save"
                  type="submit"
                  onClick={(e) => editUser(employee.employee_id, e)}
                  className="update-button"
                ></Button>
              )}
            </div>
          </form>
        )}
      </div>
      {showPopup && <Popup />}
    </div>
  );
}
