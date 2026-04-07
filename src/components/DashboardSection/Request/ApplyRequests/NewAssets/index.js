import React from "react";
import AssetsForm from "../../../../Utils/AssetsForm";
import axios from "axios";
import { usePopup } from "../../../../../context/popup-context/Popup";
import { Popup } from "../../../../Utils/Popup/Popup";

export default function NewAssets({ onClose }) {

  const { showPopup, setShowPopup, setMessage } = usePopup();

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
  async function getData({ newAssetData }) {
    const { companyCode, employeeId } = getCompanyCodeAndTokenFromCookies();
    if (!companyCode || !employeeId) {
      setShowPopup(true);
      setMessage("Missing company code or employee ID. Please try again.");
      setTimeout(() => setShowPopup(false), 3000);
      //alert("Missing company code or employee ID. Please try again.");
    }
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/request/new_asset`,
        newAssetData,
        { withCredentials: true }
      );
      console.log("API Response:", response.data);
      setShowPopup(true);
      setMessage("New Asset application submitted successfully!");
      setTimeout(() => setShowPopup(false), 3000);
      //alert("New Asset application submitted successfully!");
      onClose();
    } catch (error) {
      console.error("Error submitting New Asset application:", error);
      setShowPopup(true);
      setMessage("Failed to submit New Asset application. Please try again.");
      setTimeout(() => setShowPopup(false), 3000);
      //alert("Failed to submit New Asset application. Please try again.");
    }
  }
  return (
    <>
      <AssetsForm
        getData={getData}
        heading="APPLY FOR NEW ASSETS"
        placeholderVal="Describe the reason"
        name="asset_type"
      />
      { showPopup && <Popup /> }
    </>
  );
}
