import React, { useCallback, useContext, useEffect, useState } from "react";
import "../../../../ComponentsCss/GenerateSalaryComponent/PayRole/Pay_LeavesAttendance/Pay_LeavesAttendance.css";
import axios from "axios";
import PayrollRange from "../../../../Utils/PayrollRange/PayrollRange";
import Pagination from "../../../../Utils/Pagination/Pagination";
import { GlobalContext } from "../../../../../context/GlobalContext/GlobalContext";

export default function Pay_LeavesAttendance() {
  const [companyPolicy, setCompanyPolicy] = useState([]);
  const [freezedPayrollCounts, setFreezedPayrollCounts] = useState([]);
  const [pagination, setPagination] = useState(null);
  
  // 1. Grab globalData and the payCycle updater function
  const { globalData, updatePayCycle } = useContext(GlobalContext);

  const companyCode = globalData?.userInfo?.companyCode;
  const month = globalData?.month; // 1 to 12
  const year = globalData?.year;

  const getAllDetails = useCallback(
    async (page = 1, search = "") => {
      if (!companyCode) return;

      try {
        // A. Fetch Company Policy to get payroll start/end days
        const policyRes = await axios.get(
          `${process.env.REACT_APP_API_URL}/getPerticularPolicy/${companyCode}`,
        );
        
        const policyData = policyRes.data.data;
        setCompanyPolicy(policyData);
        
        const sDay = policyData?.payroll_cycle?.start_day || 1;
        const eDay = policyData?.payroll_cycle?.end_day || 31;

        // B. Calculate Actual Dates using your utility
        const { startDate, endDate } = PayrollRange(
          year,
          month,
          Number(sDay),
          Number(eDay)
        );

        // C. ⭐ STORE PAYCYCLE IN GLOBAL CONTEXT ⭐
        // This ensures RunPayroll and ConfirmPayroll can access these exact dates!
        updatePayCycle({
          startDate: startDate,
          endDate: endDate,
          periodKey: `${startDate}__${endDate}` 
        });

        // D. Format month securely (e.g., converts "2" to "02" -> "2026-02")
        const formattedMonth = `${year}-${month.toString().padStart(2, "0")}`;

        // E. Fetch Attendance Counts
        const queryParams = new URLSearchParams({
          companyCode: companyCode,
          month: formattedMonth, 
          page,
          limit: 20,
          search: search,
        });

        const attendnaceCount = await axios.get(
          `${process.env.REACT_APP_API_URL}/payrole/get_all_payroleCounts_monthwise?${queryParams}`,
        );

        const attendanceCountData = attendnaceCount?.data?.data || [];
        
        setFreezedPayrollCounts(attendanceCountData);
        setPagination(attendnaceCount?.data?.pagination);
        
      } catch (error) {
        console.error("Failed to fetch attendance details:", error);
      }
    },
    // Ensure the function updates whenever the selected month/year changes
    [companyCode, month, year, updatePayCycle] 
  );

  // Trigger fetch when component loads OR when global Date/Month changes
  useEffect(() => {
    getAllDetails();
  }, [getAllDetails]);

  // const handleView = (recordCode) => { ... };
  // const handleEdit = (recordCode) => { ... };

  return (
    <div className="leaves-attendance-container">
      {/* <p className="page-description">
        Update leaves & attendance of employees here. <a href="#!">View FAQs</a>
      </p> */}

      <div className="controls-section">
        <input
          type="text"
          placeholder="Search Employee - Code/Name"
          className="search-input"
          onChange={(e) => getAllDetails(1, e.target.value)}
        />
      </div>

      <div className="table-container__pay_adjustment">
        <table className="attendance-table__pay_adjustment">
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Total Days</th>
              <th>Total LOP</th>
              <th>Payable Days</th>
            </tr>
          </thead>
          <tbody>
            {freezedPayrollCounts.map((record, index) => (
              <tr key={record.employee_id || index}>
                <td>{record.employee_id}</td>
                <td>{record.employee_name}</td>
                <td>{record.totalDays}</td>
                <td>{record.totalLOP}</td>
                <td>{record.payableDays}</td>
              </tr>
            ))}
            {freezedPayrollCounts.length === 0 && (
              <tr>
                <td colSpan="5" className="no-data-cell">
                  No attendance records found for this month.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {pagination && (
        <Pagination
          pagination={pagination}
          onPageChange={(page) => getAllDetails(page)}
        />
      )}
    </div>
  );
}