import React, { useEffect, useState } from "react";
import "../../ComponentsCss/ProfileComponent/ProfileComponent.css";
import DisplayDetailsOfUser from "./DisplayDetailsOfUser";
import { useLocation, useNavigate } from "react-router-dom";
import NewUserSection from "../NewUserSection/NewUserSection";

const ProfileComponent = ({ employeeData }) => {
  const location = useLocation();
  const navigate = useNavigate();
  let [currentSection, setCurrentSection] = useState(0);   
  const [checkedSections, setCheckedSections] = useState([0]);
  const [sectionValidity, setSectionValidity] = useState({});
  const [sectionValidityArray, setSectionValidityArray] = useState({});
  const [employee, setEmployee] = useState(
    location.state?.employee || employeeData
  );

  // const [employee, setEmployee] = useState({});

  useEffect(() => {
    if (employeeData) {
      setEmployee(employeeData);
    }
  }, [employeeData]);

  // Show loading state if data is not ready
  if (!employee?.employee_details) {
    return <div>Loading...</div>;
  }
  // console.log("em......", employeeData);

  // useEffect(() => {
  //   if (employeeData && !employee) {
  //     setEmployee(employeeData);
  //   }
  // }, [employeeData, employee]);
  // if (!employee) {
  //   return <p>No employee data available</p>;
  // }

  // const handleNext = () => {
  //   if (currentSection < sections.length - 1) {
  //     setCurrentSection((prev) => {
  //       const nextSection = prev + 1; // Get the next section index

  //       setCheckedSections((prevChecked) => {
  //         // Ensure no duplicate entries in checkedSections
  //         return prevChecked.includes(nextSection)
  //           ? prevChecked
  //           : [...prevChecked, nextSection];
  //       });

  //       return nextSection; // Update current section correctly
  //     });
  //   }
  // };

  // const handlePrevious = () => {
  //   if (currentSection > 0) {
  //     // Remove the last checked section
  //     setCheckedSections((prev) => {
  //       const updatedSections = [...prev];
  //       updatedSections.pop(); // Remove the last checked section
  //       return updatedSections;
  //     });

  //     // Move to the previous section
  //     setCurrentSection((prev) => prev - 1);
  //   }
  // };
  // const updateSectionValidity = (index, isValid) => {
  //   setSectionValidity((prev) => ({ ...prev, [index]: isValid }));
  //   setSectionValidityArray((prev) => ({ ...prev, [index]: isValid }));
  // };
  // Retrieve the employee object from state
  // const { state } = location;
  // const employee = state?.employee;

  // Use data from state if available, otherwise use employeeData from props
  // const employee = location.state?.employee || employeeData;
  // console.log("Employee data:", employee);

  // if (!employee) {
  //   navigate("/dashboard/users");
  //   return null;
  // }

  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const currentDate = new Date();
    let age = currentDate.getFullYear() - birthDate.getFullYear();
    const monthDiff = currentDate.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && currentDate.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  // const age = employee.personal_details?.date_of_birth
  //   ? calculateAge(employee.personal_details.date_of_birth)
  //   : "N/A";

  // Dynamically render sections
  // const renderSection = (header, data) => {
  //   if (!data || Object.keys(data).length === 0) return null;
  //   return (
  //     <DisplayDetailsOfUser
  //       key={header}
  //       header={header}
  //       mode="readonly"
  //       {...data}
  //     />
  //   );
  // };
  // Sections array
  // const sections = [
  //   {
  //     component: (
  //       <DisplayDetailsOfUser
  //         // isChecked={checkedSections.includes(currentSection)}
  //         checkedSections={checkedSections}
  //         setCheckedSections={setCheckedSections}
  //         setCurrentSection={setCurrentSection}
  //         sectionIndex={currentSection}
  //         handleNext={handleNext}
  //         handlePrevious={handlePrevious}
  //         header="Employee Details"
  //         mode="readonly"
  //         {...employee.employee_details}
  //         // {...employeeData.employee_details}
  //         updateSectionValidity={updateSectionValidity}
  //         sectionValidity={sectionValidity}
  //       />
  //     ),
  //   },
  //   {
  //     component: (
  //       <DisplayDetailsOfUser
  //         checkedSections={checkedSections}
  //         setCheckedSections={setCheckedSections}
  //         setCurrentSection={setCurrentSection}
  //         sectionIndex={currentSection}
  //         handleNext={handleNext}
  //         handlePrevious={handlePrevious}
  //         header="Official Details"
  //         mode="readonly"
  //         // {...employeeData.official_details}
  //         {...employee.official_details}
  //         // department={data.data.department}
  //         // designation={data.data.designation}
  //         // employee_status={data.data.employee_status}
  //         // role={data.data.role}
  //         // reporting_manager={data.data.reporting_manager}
  //         // employee_type={data.data.employee_type}
  //         // job_roles={data.data.job_roles}
  //         // onChange={(field, value) =>
  //         //   handleChange("official_details", field, value)
  //         // }
  //         updateSectionValidity={updateSectionValidity}
  //         sectionValidity={sectionValidity}
  //       />
  //     ),
  //   },
  //   {
  //     component: (
  //       <DisplayDetailsOfUser
  //         checkedSections={checkedSections}
  //         setCheckedSections={setCheckedSections}
  //         setCurrentSection={setCurrentSection}
  //         sectionIndex={currentSection}
  //         handleNext={handleNext}
  //         handlePrevious={handlePrevious}
  //         header="Personal Details"
  //         mode="readonly"
  //         {...employee.personal_details}
  //         updateSectionValidity={updateSectionValidity}
  //         sectionValidity={sectionValidity}
  //         // pan={data.data.pan}
  //         // personal_email={data.data.personal_email}
  //         // date_of_birth={data.data.date_of_birth}
  //         // onChange={(field, value) =>
  //         //   handleChange("personal_details", field, value)
  //         // }
  //       />
  //     ),
  //   },
  //   {
  //     component: (
  //       <DisplayDetailsOfUser
  //         checkedSections={checkedSections}
  //         setCheckedSections={setCheckedSections}
  //         setCurrentSection={setCurrentSection}
  //         sectionIndex={currentSection}
  //         handleNext={handleNext}
  //         handlePrevious={handlePrevious}
  //         header="Other Details"
  //         mode="readonly"
  //         {...employee.other_details}
  //         updateSectionValidity={updateSectionValidity}
  //         sectionValidity={sectionValidity}
  //         // marital_status={data.data.marital_status}
  //         // passport={data.data.passport}
  //         // father_name={data.data.father_name}
  //         // mother_name={data.data.mother_name}
  //         // blood_group={data.data.blood_group}
  //         // onChange={(field, value) =>
  //         //   handleChange("other_details", field, value)
  //         // }
  //       />
  //     ),
  //   },
  //   {
  //     component: (
  //       <DisplayDetailsOfUser
  //         checkedSections={checkedSections}
  //         setCheckedSections={setCheckedSections}
  //         setCurrentSection={setCurrentSection}
  //         sectionIndex={currentSection}
  //         handleNext={handleNext}
  //         handlePrevious={handlePrevious}
  //         header="Temporary Address"
  //         mode="readonly"
  //         {...employee.temporary_address}
  //         updateSectionValidity={updateSectionValidity}
  //         sectionValidity={sectionValidity}
  //         // city={data.data.temporary_address.city}
  //         // pin_code={data.data.temporary_address.pin_code}
  //         // state={data.data.temporary_address.state}
  //         // onChange={(field, value) =>
  //         //   handleChange("temporary_address", field, value)
  //         // }
  //       />
  //     ),
  //   },
  //   {
  //     component: (
  //       <DisplayDetailsOfUser
  //         checkedSections={checkedSections}
  //         setCheckedSections={setCheckedSections}
  //         setCurrentSection={setCurrentSection}
  //         sectionIndex={currentSection}
  //         handleNext={handleNext}
  //         handlePrevious={handlePrevious}
  //         header="Permanent Address"
  //         mode="readonly"
  //         {...employee.permanent_address}
  //         updateSectionValidity={updateSectionValidity}
  //         sectionValidity={sectionValidity}
  //         // city={data.data.permanent_address.city}
  //         // pin_code={data.data.permanent_address.pin_code}
  //         // state={data.data.permanent_address.state}
  //         // onChange={(field, value) =>
  //         //   handleChange("permanent_address", field, value)
  //         // }
  //       />
  //     ),
  //   },
  // ];

  return (
    <>
      <div className="profile-component-container">
        {/* <div className="profile-sidebar">
          <div className="profile-avatar"></div>
          <h2>{employee.employee_details?.name || "Anonymous"}</h2>

          <div className="profile-details">
            <p>
              <span className="profile-label">Designation</span>
              <span className="profile-value">
                {employee.official_details?.designation || "N/A"}
              </span>
            </p>
            <p>
              <span className="profile-label">Phone Number</span>
              <span className="profile-value">
                {employee.employee_details?.contact || "N/A"}
              </span>
            </p>
            <p>
              <span className="profile-label">E-mail Address</span>
              <span className="profile-value email">
                {employee.employee_details?.email || "N/A"}
              </span>
            </p>
            <p>
              <span className="profile-label">Department</span>
              <span className="profile-value">
                {employee.official_details?.department || "N/A"}
              </span>
            </p>
            <p>
              <span className="profile-label">Age</span>
              <span className="profile-value">{age}</span>
            </p>
            <p>
              <span className="profile-label">Reporting Manager</span>
              <span className="profile-value">
                {employee.official_details?.reporting_manager || "N/A"}
              </span>
            </p>
            <p>
              <span className="profile-label">Job Role </span>
              <span className="profile-value">
                {employee.job_roles || "N/A"}
              </span>
            </p>
          </div>
        </div> */}

        <div className="profile-main-content">
          {/* <div className="DisplayDetailsOfUser" key={currentSection}>
            {sections[currentSection].component}
          </div> */}
          <NewUserSection mode={"view"} />
        </div>
      </div>
    </>
  );
};

export default ProfileComponent;
