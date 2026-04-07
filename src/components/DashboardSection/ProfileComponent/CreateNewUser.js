import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DisplayDetailsOfUser from "./DisplayDetailsOfUser";
import validator from "validator";
import "../../ComponentsCss/ProfileComponent/CreateNewUser.css";

function CreateNewUser() {
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState(0);
  const [employeeId, setEmployeeId] = useState("");
  const [checkedSections, setCheckedSections] = useState([0]);
  const [sectionValidity, setSectionValidity] = useState({});
  const [sectionValidityArray, setSectionValidityArray] = useState({});

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
          Math.floor(Math.random() * allChars.length)
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

  const [data, setData] = useState({
    data: {
      employee_id: "",
      employee_type: "",
      group_id: null,
      name: "",
      gender: "",
      contact: "",
      email: "",
      password: "subhamAgrawal@123",
      pan: "",
      aadharcard: "",
      personal_email: "",
      date_of_birth: "",
      temporary_address: {
        state: "",
        city: "",
        pin_code: "",
        address_line_1: "",
        address_line_2: "",
      },
      permanent_address: {
        state: "",
        city: "",
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
      account_name: "",
      account_number: "",
      ifsc_code: "",
      esi_number: "",
      pf_number: "",
      job_roles: [],
    },
  });

  const getCompanyCodeAndTokenFromCookies = () => {
    const cookies = document.cookie.split("; ");
    const companyCookie = cookies.find((cookie) =>
      cookie.startsWith("companyCode=")
    );
    const companyCode = companyCookie ? companyCookie.split("=")[1] : null;
    return { companyCode };
  };

  const getEmployeeId = async () => {
    try {
      const { companyCode } = getCompanyCodeAndTokenFromCookies();
      if (!companyCode) {
        alert("Company code not found. Please ensure you are logged in.");
        return;
      }
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/company/${companyCode}/generate-employee-id`,
        {
          withCredentials: true,
        }
      );
      const newId = response.data?.new_id || "";
      if (!newId) {
        console.error("Employee ID not found in response:", response.data);
        alert("Failed to retrieve Employee ID.");
        return;
      }
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

  useEffect(() => {
    getEmployeeId();
  }, []);

  const handleChange = (section, field, value) => {
    setData((prevData) => {
      const updatedData = { ...prevData };
      if (section === "temporary_address" || section === "permanent_address") {
        updatedData.data[section] = {
          ...updatedData.data[section],
          [field]: value,
        };
      } else {
        updatedData.data[field] = value;
      }
      return updatedData;
    });
  };

  const handleNext = () => {
    if (currentSection < sections.length - 1) {
      const nextSection = currentSection + 1;
      setCheckedSections((prevChecked) => {
        if (!prevChecked.includes(nextSection)) {
          return [...prevChecked, nextSection];
        }
        return prevChecked;
      });
      setCurrentSection(nextSection);
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

  const updateSectionValidity = (index, isValid) => {
    setSectionValidity((prev) => ({ ...prev, [index]: isValid }));
    setSectionValidityArray((prev) => ({ ...prev, [index]: isValid }));
  };

  const sections = [
    {
      component: (
        <DisplayDetailsOfUser
          checkedSections={checkedSections}
          setCheckedSections={setCheckedSections}
          sectionIndex={0}
          handleNext={handleNext}
          handlePrevious={handlePrevious}
          setCurrentSection={setCurrentSection}
          header="Employee Details"
          mode="create"
          name={data.data.name}
          contact={data.data.contact}
          gender={data.data.gender}
          email={data.data.email}
          onChange={(field, value) =>
            handleChange("employee_details", field, value)
          }
          updateSectionValidity={updateSectionValidity}
          sectionValidity={sectionValidity}
        />
      ),
    },
    {
      component: (
        <DisplayDetailsOfUser
          checkedSections={checkedSections}
          setCheckedSections={setCheckedSections}
          sectionIndex={1}
          handleNext={handleNext}
          handlePrevious={handlePrevious}
          setCurrentSection={setCurrentSection}
          header="Official Details"
          mode="create"
          department={data.data.department}
          designation={data.data.designation}
          employee_status={data.data.employee_status}
          role={data.data.role}
          reporting_manager={data.data.reporting_manager}
          employee_type={data.data.employee_type}
          job_roles={data.data.job_roles}
          Week_Off={data.data.Week_Off || ""}
          onChange={(field, value) =>
            handleChange("official_details", field, value)
          }
          updateSectionValidity={updateSectionValidity}
          sectionValidity={sectionValidity}
        />
      ),
    },
    {
      component: (
        <DisplayDetailsOfUser
          checkedSections={checkedSections}
          setCheckedSections={setCheckedSections}
          sectionIndex={2}
          handleNext={handleNext}
          handlePrevious={handlePrevious}
          setCurrentSection={setCurrentSection}
          header="Personal Details"
          mode="create"
          pan={data.data.pan}
          personal_email={data.data.personal_email}
          date_of_birth={data.data.date_of_birth}
          onChange={(field, value) =>
            handleChange("personal_details", field, value)
          }
          updateSectionValidity={updateSectionValidity}
          sectionValidity={sectionValidity}
        />
      ),
    },
    {
      component: (
        <DisplayDetailsOfUser
          checkedSections={checkedSections}
          setCheckedSections={setCheckedSections}
          sectionIndex={3}
          handleNext={handleNext}
          handlePrevious={handlePrevious}
          setCurrentSection={setCurrentSection}
          header="Other Details"
          mode="create"
          marital_status={data.data.marital_status}
          passport={data.data.passport}
          father_name={data.data.father_name}
          mother_name={data.data.mother_name}
          blood_group={data.data.blood_group}
          onChange={(field, value) =>
            handleChange("other_details", field, value)
          }
          updateSectionValidity={updateSectionValidity}
          sectionValidity={sectionValidity}
        />
      ),
    },
    {
      component: (
        <DisplayDetailsOfUser
          checkedSections={checkedSections}
          setCheckedSections={setCheckedSections}
          sectionIndex={4}
          handleNext={handleNext}
          handlePrevious={handlePrevious}
          setCurrentSection={setCurrentSection}
          header="Temporary Address"
          mode="create"
          city={data.data.temporary_address.city}
          pin_code={data.data.temporary_address.pin_code}
          state={data.data.temporary_address.state}
          onChange={(field, value) =>
            handleChange("temporary_address", field, value)
          }
          updateSectionValidity={updateSectionValidity}
          sectionValidity={sectionValidity}
        />
      ),
    },
    {
      component: (
        <DisplayDetailsOfUser
          checkedSections={checkedSections}
          setCheckedSections={setCheckedSections}
          sectionIndex={5}
          handleNext={handleNext}
          handlePrevious={handlePrevious}
          setCurrentSection={setCurrentSection}
          header="Permanent Address"
          mode="create"
          city={data.data.permanent_address.city}
          pin_code={data.data.permanent_address.pin_code}
          state={data.data.permanent_address.state}
          onChange={(field, value) =>
            handleChange("permanent_address", field, value)
          }
          updateSectionValidity={updateSectionValidity}
          sectionValidity={sectionValidity}
        />
      ),
    },
  ];

  const handleSave = async () => {
    try {
      const { companyCode } = getCompanyCodeAndTokenFromCookies();
      if (!companyCode) {
        alert("Company code not found. Please ensure you are logged in.");
        return;
      }

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/company/${companyCode}/create-employee`,
        data,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        alert("User created successfully!");
        setData({
          ...data,
          data: { ...data.data, password: generatePassword() },
        });
        navigate("/dashboard/users");
      } else {
        console.error("Failed to create user:", response.statusText);
        alert("Failed to create user.");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      alert("An error occurred while creating the user.");
    }
  };

  const handleEmployeeIdChange = (e) => {
    const newId = e.target.value;
    setEmployeeId(newId);
    setData((prevData) => ({
      ...prevData,
      data: {
        ...prevData.data,
        employee_id: newId,
      },
    }));
  };

  return (
    <div className="CreateNewUser">
      <div className="CreateNewUser_employeid">
        <h3>Employee ID:</h3>
        <input
          type="text"
          value={employeeId}
          onChange={handleEmployeeIdChange}
          placeholder="Generating..."
          style={{ padding: "5px", width: "200px" }}
        />
      </div>
      <div className="DisplayDetailsOfUser" key={currentSection}>
        {sections[currentSection].component}
      </div>
      <button className="newUser_save_btn" onClick={handleSave}>
        Save New User
      </button>
    </div>
  );
}

export default CreateNewUser;
