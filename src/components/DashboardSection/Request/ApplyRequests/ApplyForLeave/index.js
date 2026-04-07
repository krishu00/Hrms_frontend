import axios from "axios";
import LeaveApplyForms from "../../../../Utils/LeaveApplyForm/LeaveApply";
import { usePopup } from "../../../../../context/popup-context/Popup";
import { Popup } from "../../../../Utils/Popup/Popup";
import { useNavigate } from "react-router-dom";

function ApplyForLeave({ onClose,leaveBalance }) {
  const { showPopup, setShowPopup, setMessage } = usePopup();
  const navigate = useNavigate();

  const getCompanyCodeAndTokenFromCookies = () => {
    const cookies = document.cookie.split("; ");

    const companyCookie = cookies.find((cookie) =>
      cookie.startsWith("companyCode=")
    );

    const companyCode = companyCookie ? companyCookie.split("=")[1] : null;

    const employeeCookie = cookies.find((cookie) =>
      cookie.startsWith("employee_id=")
    );

    const employeeId = employeeCookie ? employeeCookie.split("=")[1] : null;

    return { companyCode, employeeId };
  };
  async function getData({ leaveData }) {
    console.log("Sending data:========", leaveData);

    // Prepare data and send
    const { companyCode, employeeId } = getCompanyCodeAndTokenFromCookies();
    if (!companyCode || !employeeId) {
      setShowPopup(true);
      setMessage("Missing company code or employee ID. Please try again.");
      setTimeout(() => setShowPopup(false), 3000);
      //alert("Missing company code or employee ID. Please try again.");
      return;
    }
    console.log("Request Body:", leaveData);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/request/leave`,
        leaveData,

        { withCredentials: true }
      );
      console.log("API Response:", response.data);
      setShowPopup(true);
      setMessage("Leave application submitted successfully!");
      setTimeout(() => setShowPopup(false), 3000);
      //alert("Leave application submitted successfully!");
      setTimeout(() => {
        onClose();
        navigate("/dashboard/request", { state: { refresh: true } });
      }, 1000);
    } catch (error) {
      console.error("Error submitting leave application:", error);
      setShowPopup(true);
      setMessage(
        `Failed to submit leave application. ${error.response.data.message}`
      );
      setTimeout(() => setShowPopup(false), 3000);
      //alert("Failed to submit leave application. Please try again.");
    }
  }

  return (
    <div>
      <LeaveApplyForms getData={getData} leaveBalance={leaveBalance} />
      {showPopup && <Popup />}
    </div>
  );
}

export default ApplyForLeave;
