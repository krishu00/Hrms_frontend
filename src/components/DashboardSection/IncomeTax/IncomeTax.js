import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "../../ComponentsCss/AdminPanel/AdminPanel.css";
import TaxOption from "./Sections/TaxOption";
import Deduction from "./Sections/DeductionSec16";
import PreviousITDetails from "./Sections/PreviousITDetails";
import ExemptionSec10 from "./Sections/ExemptionSec10";
import HouseRent from "./Sections/HouseRent";
import DeductionChapter6A from "./Sections/DeductionChapter6A";
import OtherIncome from "./Sections/OtherIncome";
import ProofVerification from "./Sections/ProofVerification";
import TdsTcs from "./Sections/TdsTcs";

const IncomeTax = () => {
  const location = useLocation();
  const [activeSectionId, setActiveSectionId] = useState(
    location.state?.activeSectionId || "tax_option"
  );
  const [selectedEmployee, setSelectedEmployee] = useState(
    location.state?.employee || null
  );
  
  const sections = [
    { id: "tax_option", name: "Tax Option" },
    { id: "deduction_under_sec_16", name: "Deduction Under Section 16" },
    { id: "employee_previous_it_detail", name: "Employee Previous IT Details" },
    { id: "exemption_under_sec_10", name: "Exemption Under Section 10" },
    { id: "house_rent_reciept", name: "House Rent Reciept" },
    { id: "deduction_under_sec_6a", name: "Deduction Under Section 6A" },
    { id: "other_income", name: "Other Income" },
    { id: "proof_verification", name: "Proof Verification" },
    { id: "tds_tcs_source", name: "TDS & TCS at Source as per Form 12BAA" },
  ];

  useEffect(() => {
    if (location.state?.employee) {
      setSelectedEmployee(location.state.employee);
    }

    if (location.state?.activeSectionId) {
      setActiveSectionId(location.state.activeSectionId);
    }
  }, [location.state]);

  const sharedSectionProps = {
    selectedEmployee,
    onEmployeeSelect: setSelectedEmployee,
  };

  const handleRowClick = (sectionId) => {
    setActiveSectionId(sectionId);
  };

  const rendersection = () => {
    switch (activeSectionId) {
      case "tax_option":
        return <TaxOption {...sharedSectionProps} />;
      case "deduction_under_sec_16":
        return <Deduction {...sharedSectionProps} />;
      case "employee_previous_it_detail":
        return <PreviousITDetails {...sharedSectionProps} />;
      case "exemption_under_sec_10":
        return <ExemptionSec10 {...sharedSectionProps} />;
      case "house_rent_reciept":
        return <HouseRent {...sharedSectionProps} />;
      case "deduction_under_sec_6a":
        return <DeductionChapter6A {...sharedSectionProps} />;
      case "other_income":
        return <OtherIncome {...sharedSectionProps} />;
      case "proof_verification":
        return <ProofVerification {...sharedSectionProps} />;
      case "tds_tcs_source":
        return <TdsTcs {...sharedSectionProps} />;
      default:
        return <div>Select a section from the left.</div>;
    }
  };

  return (
    <div className="admin-panel-layout">
      <div className="admin-panel-menu">
        <table className="reports-table">
          <thead>
            <tr>
              <th className="table-header">Sections</th>
            </tr>
          </thead>
          <tbody>
            {sections.map((section) => (
              <tr
                key={section.id}
                onClick={() => handleRowClick(section.id)}
                style={{
                  cursor: "pointer",
                  backgroundColor:
                    activeSectionId === section.id ? "#dff0d8" : "white",
                  fontWeight: activeSectionId === section.id ? "700" : "normal",
                }}
              >
                <td className="table-cell">{section.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="admin-panel-content">{rendersection()}</div>
    </div>
  );
};

export default IncomeTax;
