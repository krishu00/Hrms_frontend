import React, { useEffect, useState } from "react";
import "../../ComponentsCss/Request/ApplyRequests/ApplyLeaveForm/ApplyLeaveForm.css";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";
import { useSubmitting } from "../useSubmitting";
import SubmitButton from "../SubmitButton";

function LeaveApplyForms({ getData, leaveBalance: propLeaveBalance }) {
  const [isOpen, setIsOpen] = useState(false);

  const { isSubmitting, run } = useSubmitting();

  const [calculatedDays, setCalculatedDays] = useState(0); // Initialize as 0

  const [leaveData, setLeaveData] = useState({
    start_date: "",
    end_date: "",
    start_day_type: "full_day",
    end_day_type: "full_day",
    leave_type: "",
    number_of_days: 0,
    reason: "",
  });

  const calculateDays = (data) => {
    const start = new Date(data.start_date);
    const end = new Date(data.end_date);
    console.log("start", start);
    console.log("end",end);
    if (!data.start_date || !data.end_date || start > end) {
      return 0;
    }

    let diffDays = (end - start) / (1000 * 60 * 60 * 24) + 1;

    // Subtract 0.5 for half-day sessions
    if (
      (+start == +end) &&
      (data.start_day_type === "first_session")  
    ) {
      data.end_day_type = "first_session"
      diffDays = 0.5;
    }
    if (
      (+start == +end) &&
      (data.start_day_type === "second_session")  
    ) {
      data.end_day_type = "second_session"
      diffDays = 0.5;
    }
    if ((+start !== +end) &&
      (data.start_day_type === "first_session" || 
        data.start_day_type === "second_session") 
    ) {
      diffDays -= 0.5;
    }
    
    if ((+start !== +end) &&
      data.end_day_type === "first_session" ||
      data.end_day_type === "second_session"
    ) {
      diffDays -= 0.5;
    }

    //  if (
    //   data.start_day_type === "second_session" &&
    //   data.end_day_type === "full_day"
    // ) {
    //   diffDays -= 0.5;
    // }

    // if (
    //   data.start_day_type === "second_session" &&
    //   data.end_day_type === "second_session"
    // ) {
    //   diffDays -= 0.5;
    // }
    // if (
    //   data.start_day_type === "second_session" &&
    //   data.end_day_type === "first_session"
    // ) {
    //   diffDays -= 1;
    // }
  
    
  
    return diffDays > 0 ? diffDays : 0;
  };



  useEffect(() => {
    setCalculatedDays(leaveData.number_of_days);
  }, [leaveData.number_of_days]);

  function inputData(event) {
    const { name, value } = event.target;

    setLeaveData((prev) => {
      const updated = {
        ...prev,
        [name]: value, 
      };
      if (
        ["start_date", "end_date", "start_day_type", "end_day_type"].includes(
          name
        )
      ) {
        const days = calculateDays(updated);
        updated.number_of_days = days;
      }

      return updated;
    });
  }

  async function sendData(e) {
    e.preventDefault();
    run(async () => {
      console.log("leave data", leaveData);
      await getData({ leaveData });
    });
  }

const availableLeaves = propLeaveBalance?.leaveDetails || [];

  return (
    <>
      <div className="main_Apply_leaveForm">
        <div className="center_LeaveForm">
          <div className="heading_ApplyForm">
            <h2>Apply for leave</h2>
          </div>
          <form onSubmit={sendData}>
            <div className="form_Input">
              <div className="selectWrapper">
                <div className="date_Section">
                  <select
                    className="leaveType"
                    name="leave_type"
                    onChange={inputData}
                    onBlur={() => setIsOpen(false)}
                    required
                    onClick={() => setIsOpen(!isOpen)}
                    value={leaveData.leave_type}
                  >
                    <option disabled value="">
                      Select Leave Type
                    </option>

                    {availableLeaves.map((leave, index) => (
                      <option
                        key={leave.leaveTypeId || `leave-key-${index}`}
                        value={leave.leaveTypeName}
                      >
                        {leave.leaveTypeName}
                      </option>
                    ))}
                  </select>
                  {/* <span className="leaveiconarrow">
                    {isOpen ? <FaChevronUp /> : <FaChevronDown />}
                  </span> */}

                  <input
                    type="number"
                    name="number_of_days"
                    placeholder="Number of days"
                    // Make calculated days read-only as it's derived
                    readOnly
                    value={calculatedDays.toString()}
                  ></input>
                </div>
              </div>

              <div className="date_Section">
                <input
                  type="text"
                  name="start_date"
                  placeholder="start date"
                  onFocus={(e) => (e.target.type = "date")}
                  onBlur={(e) => (e.target.type = "text")}
                  onChange={inputData}
                  required
                ></input>

                <select name="start_day_type" onChange={inputData}>
                  <option value="full_day">Full Day</option>
                  <option value="first_session">First Session</option>
                  <option value="second_session">Second Session</option>
                </select>
              </div>
              <div className="date_Section">
                <input
                  type="text"
                  name="end_date"
                  placeholder="end date"
                  onFocus={(e) => (e.target.type = "date")}
                  onBlur={(e) => (e.target.type = "text")}
                  onChange={inputData}
                  required
                ></input>

                <select name="end_day_type" onChange={inputData}>
                  <option value="full_day">Full Day</option>
                  <option value="first_session">First Session</option>
                  <option value="second_session">Second Session</option>
                </select>
              </div>

              <textarea
                id="text"
                className="leave_text_area"
                name="reason"
                placeholder=" Reason for Leave"
                onChange={inputData}
                required
              ></textarea>

              <div className="apply_leave btn_Submit">
                <SubmitButton type="submit" loading={isSubmitting}>
                  Submit
                </SubmitButton>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
export default LeaveApplyForms;
