import React, { useState, useContext, useEffect } from "react";
import "../../../ComponentsCss/GenerateSalaryComponent/PayRole/PayRole.css";
import SelectionLocation from "./SelectionLocation/SelectionLocation";
import LeavesAttendance from "./Pay_LeavesAttendance/Pay_LeavesAttendance";
import PayAdjustment from "./PayAdjustment/PayAdjustment";
import RunPayroll from "./RunPayroll/RunPayroll";
import ConfermPayroll from "./ConfermPayroll/ConfermPayroll";
import CompletePayroll from "./Complte/CompletePayroll";
import Button from "../../../../context/GlobalButton/globalButton";
import { GlobalContext } from "../../../../context/GlobalContext/GlobalContext";

const stepsConfig = [
  { id: 1, title: "SELECT LOCATION", Component: SelectionLocation },
  { id: 2, title: "LEAVES & ATTENDANCE", Component: LeavesAttendance },
  { id: 3, title: "PAY ADJUSTMENT", Component: PayAdjustment },
  { id: 4, title: "RUN PAYROLL", Component: RunPayroll },
  { id: 5, title: "CONFIRM PAYROLL", Component: ConfermPayroll },
  { id: 6, title: "COMPLETE", Component: CompletePayroll },
];

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function PayRoll() {
  const [currentStep, setCurrentStep] = useState(1);
  const [show, setShow] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");

  // Grab globalData and the updater function from Context
  const { globalData, updateDateFilters, updatePayCycle } =
    useContext(GlobalContext);

  // Local state for the Edit UI
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [tempMonth, setTempMonth] = useState(globalData.month);
  const [tempYear, setTempYear] = useState(globalData.year);

  // Sync local temp state if global data changes
  useEffect(() => {
    setTempMonth(globalData.month);
    setTempYear(globalData.year);
  }, [globalData.month, globalData.year]);

  // Handle saving the new date to the Global Context
  const handleSaveDate = () => {
    updateDateFilters(tempMonth, tempYear);
    setIsEditingDate(false);
  };

  const handleNext = () => {
    setCurrentStep((prevStep) => Math.min(prevStep + 1, stepsConfig.length));
  };

  const handlePrevious = () => {
    setCurrentStep((prevStep) => Math.max(prevStep - 1, 1));
  };

  const CurrentStepComponent = stepsConfig[currentStep - 1]?.Component;

  // Get the display name for the current month in context (Subtract 1 because array is 0-indexed)
  const displayMonthName = monthNames[globalData.month - 1];

  return (
    <div className="payrole-outer">
      <div className="run_pay_role_outer">
        {/* EDIT DATE SECTION */}
        <div className="pay_role_inner_input_section payroll-edit-container">
          {isEditingDate ? (
            <div className="payroll-edit-controls">
              <select
                value={tempMonth}
                onChange={(e) => setTempMonth(Number(e.target.value))}
                className="payroll-edit-select"
              >
                {monthNames.map((m, index) => (
                  <option key={index} value={index + 1}>
                    {m}
                  </option>
                ))}
              </select>

              <select
                value={tempYear}
                onChange={(e) => setTempYear(Number(e.target.value))}
                className="payroll-edit-select"
              >
                <option value={2025}>2025</option>
                <option value={2026}>2026</option>
                <option value={2027}>2027</option>
              </select>

              <button onClick={handleSaveDate} className="payroll-btn-save">
                Save
              </button>
              <button
                onClick={() => setIsEditingDate(false)}
                className="payroll-btn-cancel"
              >
                Cancel
              </button>
            </div>
          ) : (
            <h5 className="payroll-header-text">
              Payroll for the month of {displayMonthName}-{globalData.year}
              <button
                onClick={() => setIsEditingDate(true)}
                className="payroll-btn-edit"
              >
                ✏️ Edit
              </button>
            </h5>
          )}
        </div>

        <div className=" container_payroll_tracker">
          {stepsConfig.map((step) => (
            <div className="select_location_section" key={step.id}>
              <div
                className={`num1 ${currentStep === step.id ? "active" : ""} ${
                  currentStep > step.id ? "completed" : ""
                }`}
              >
                <span>{currentStep > step.id ? "" : step.id}</span>
              </div>
              <p>{step.title}</p>
            </div>
          ))}
        </div>

        <div className="step-content-area">
          {CurrentStepComponent && (
            <CurrentStepComponent selectedDate={selectedDate} show={show} />
          )}
        </div>
      </div>

      <div className="payrollBtn">
        <Button
          text="Previous"
          onClick={handlePrevious}
          disabled={currentStep === 1}
        ></Button>
        <Button
          text={currentStep === stepsConfig.length ? "Finish" : "Next"}
          onClick={handleNext}
          disabled={currentStep === stepsConfig.length}
        ></Button>
      </div>
    </div>
  );
}
