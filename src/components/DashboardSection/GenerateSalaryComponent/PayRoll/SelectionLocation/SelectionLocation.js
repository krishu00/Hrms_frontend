import React, { useEffect, useState, useCallback, useContext } from "react";
import axios from "axios";
import "../../../.../../../ComponentsCss/GenerateSalaryComponent/PayRole/SelecrionLocation/SelectionLocation.css";
import { GlobalContext } from "../../../../../context/GlobalContext/GlobalContext";

export default function SelectionLocation() {
  const [companyName, setCompanyName] = useState("");

  const { globalData } = useContext(GlobalContext);
  const companyCode = globalData?.userInfo?.companyCode;

  const getCompanyName = useCallback(async () => {
    if (!companyCode) return;

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/company/getCompanyName/${companyCode}`,
      );

      if (response?.data?.success) {
        setCompanyName(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch company name:", error.message);
    }
  }, [companyCode]);

  useEffect(() => {
    getCompanyName();
  }, [getCompanyName]);

  return (
    <div className="selectionLocation_Outer">
      <div className="selectionLocation_Inner">
        {/* <p>
          Select location for which you want to run payroll here.{" "}
          <a href="#!">View FAQs</a>
        </p> */}

        <div className="nested_container" style={{ marginTop: '20px' }}>
          
          <div className="input_selection">
            <input type="checkbox" checked readOnly />
            <p>Company</p>
          </div>

          <div className="input_selection_container" style={{ marginLeft: '28px', marginTop: '10px' }}>
            <div className="input_selection">
              <input type="checkbox" checked readOnly />
              <p style={{ fontWeight: 500 }}>{companyName || "Loading..."}</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}