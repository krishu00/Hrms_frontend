import React, { useState } from "react";
import "../../ComponentsCss/Request/ApplyRequests/ApplyLeaveForm/ApplyLeaveForm.css";
import "../../ComponentsCss/shared/loader.css";
import { useSubmitting } from "../useSubmitting";
import SubmitButton from "../SubmitButton";

function RequestHrForm(props) {
  const [options, setOptions] = useState([
    "Regarding to AL",
    "Regarding to Leave",
    "Regarding to Project",
  ]);
  const [requestHrData, setrequestHrData] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const { isSubmitting, run } = useSubmitting();

  function inputData(event) {
    let { name, value, type } = event.target;
    setInputValue(value);
    console.log("value", value);

    // if (type === "number") {
    //   value = parseInt(value, 10);
    //   if (isNaN(value)) value = "";
    // }

    setrequestHrData((old) => {
      return {
        ...old,
        [name]: value,
      };
    });
  }

  function sendData(e) {
    e.preventDefault();
    run(async () => {
      await props.getData({ requestHrData });
    });
  }
  return (
    <>
      <div className="main_Apply_leaveForm">
        <div className="center_LeaveForm">
          <div className="heading_ApplyForm">
            <h2>Request to HR</h2>
          </div>
          <form onSubmit={sendData}>
            <div className="form_Input">
              <input
                type="text"
                name="subject"
                placeholder="Subject"
                list="data"
                onChange={inputData}
                required
              ></input>
              {inputValue.length > 0 && (
                <datalist id="data" type="text">
                  {options.map((v, i) => (
                    <option key={i} value={v}></option>
                  ))}
                </datalist>
              )}

              {/* <input
                type="number"
                name="number_of_days"
                placeholder="Number of days"
                onChange={inputData}
              ></input> */}
              {/* <div className="date_Section">
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
              </div> */}

              <textarea
                id="text"
                className="leave_text_area"
                name="reason"
                placeholder="Describe the reason"
                onChange={inputData}
                cols={4}
                required
              ></textarea>
              <div className="hr btn_Submit">
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
export default RequestHrForm;
