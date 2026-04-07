import React, { useState } from "react";
import "../../ComponentsCss/Request/ApplyRequests/ApplyLeaveForm/ApplyLeaveForm.css";
import { useSubmitting } from "../useSubmitting";
import SubmitButton from "../SubmitButton";

function WorkFromHomeForm(props) {
  // const [options, setOptions] = useState([
  //   "Medical Leave",
  //   "Marriage leave",
  //   "Sabbatical Leave",
  //   "Casual leave",
  // ]);
  const [workHomeData, setWorkHomeData] = useState([]);
  const [calculatedDays, setCalculatedDays] = useState();
  const { isSubmitting, run } = useSubmitting();
  // console.log("levaeeeeeee", typeof leaveData);

  function inputData(event) {
    let { name, value, type } = event.target;
    // console.log("value", value);

    // if (type === "number") {
    //   value = parseInt(value, 10);
    //   if (isNaN(value)) value = "";
    // }

    setWorkHomeData((old) => {
      const newWorkHomeData = {
        ...old,
        [name]: value,
      };

      // Calculate the number of days if both dates are provided
      // if (name === "start_date" || name === "end_date") {
      //   const startDate = new Date(newWorkHomeData.start_date);
      //   const endDate = new Date(newWorkHomeData.end_date);

      //   if (startDate && endDate && startDate <= endDate) {
      //     const diffTime = Math.abs(endDate - startDate);
      //     const diffDays = Math.ceil(diffTime / (1000*  60*  60 * 24)); // Convert to days
      //     setCalculatedDays(diffDays);
      //     newWorkHomeData.number_of_days = diffDays; // Auto-fill the number of days
      //   } else {
      //     setCalculatedDays(0); // Reset if dates are invalid
      //   }
      // }
      if (name === "start_date" || name === "end_date") {
        const startDate = new Date(newWorkHomeData.start_date);
        const endDate = new Date(newWorkHomeData.end_date);

        if (startDate && endDate && startDate <= endDate) {
          const diffDays = (endDate - startDate) / (1000 * 60 * 60 * 24) + 1; // Inclusive
          setCalculatedDays(diffDays);
          newWorkHomeData.number_of_days = diffDays;
        } else {
          setCalculatedDays(0);
        }
      }

      return newWorkHomeData;
    });
  }

  function sendData(e) {
    e.preventDefault();
    run(async () => {
      await props.getData({ workHomeData });
    });
  }
  return (
    <>
      <div className="main_Apply_leaveForm">
        <div className="center_LeaveForm">
          <div className="heading_ApplyForm">
            <h2>Work From Home</h2>
          </div>
          <form onSubmit={sendData}>
            <div className="form_Input">
              {/* <input
                type="text"
                name="leave_type"
                placeholder="Category of leave"
                list="data"
                onChange={inputData}
                required
              ></input>
              <datalist id="data" type="text">
                {options.map((v, i) => {
                  return <option key={i} value={v}></option>;
                })}
              </datalist> */}

              <input
                type="number"
                name="number_of_days"
                placeholder="Number of days"
                onChange={inputData}
                value={calculatedDays}
              ></input>
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
                <input
                  type="text"
                  name="end_date"
                  placeholder="end date"
                  onFocus={(e) => (e.target.type = "date")}
                  onBlur={(e) => (e.target.type = "text")}
                  onChange={inputData}
                  required
                ></input>
              </div>

              <textarea
                id="text"
                className="leave_text_area"
                name="reason"
                placeholder=" Reason for Work From Home"
                onChange={inputData}
                cols={4}
                required
              ></textarea>
              <div className="btn_Submit">
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
export default WorkFromHomeForm;
