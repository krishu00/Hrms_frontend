import React, { useEffect, useState } from "react";
import axios from "axios";

const GenerateEmployeeID = ({ companyCode }) => {
  const [newEmployeeID, setNewEmployeeID] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEmployeeID = async () => {
      setLoading(true);
      try {
        // Call the API to generate a new employee ID
        const response = await axios.post(
            `${process.env.REACT_APP_API_URL}/company/${companyCode}/generate-employee-id`,
          // `http://localhost:8080/company/1/generate-employee-id`
        );

        if (response.data.success) {
          setNewEmployeeID(response.data.new_id);
        } else {
          setError(response.data.message || "Unknown error occurred");
        }
      } catch (err) {
        setError(err.response?.data?.error || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (companyCode) {
      fetchEmployeeID();
    }
  }, [companyCode]);

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {newEmployeeID && <p>New Employee ID: {newEmployeeID}</p>}
    </div>
  );
};

export default GenerateEmployeeID;
