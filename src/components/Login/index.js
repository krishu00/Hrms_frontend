import "../ComponentsCss/Login/Login.css";
import React, { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import RequestForm from "../Utils/RequestForm";
import { useAuth } from "../ComponentsCss/Authentication/authentication";
import { GlobalContext } from "../../context/GlobalContext/GlobalContext";

axios.defaults.withCredentials = true;

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { updateUserInfo } = useContext(GlobalContext);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (formData, setIsLoading, setErrorMessage) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      console.log("Login hit");

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/login`,
        {
          email: formData.email,
          password: formData.password,
          platform: "web",
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": `${process.env.REACT_APP_API_URL}`,
          },
        },
      );

      console.log("Response from API:", response.data);

      if (response.data.success) {
        const token = response.data;
        console.log("Received token:", token);
        const jobRoles = response.data.employee.job_roles;

        document.cookie = `job_roles=${JSON.stringify(jobRoles)}; path=/`;
        document.cookie = `authToken=${token}; path=/`;
        document.cookie = `employee_id=${response.data.employee.employee_id}; path=/`;
        document.cookie = `companyCode=${response.data.employee.company_code}; path=/`;
        updateUserInfo({
          employee_id: response.data.employee.employee_id,
          companyCode: response.data.employee.company_code,
          job_roles: jobRoles[0],
        });
        if (response.data.firstTimeLogin) {
          navigate("/first-time-login");
          return;
        }
        const success = await login(response.data.user);

        if (success) {
          navigate("/dashboard");
        } else {
          setErrorMessage("Failed to set user session. Please try again.");
        }
      } else {
        setErrorMessage(
          response.data.message || "Invalid credentials. Please try again.",
        );
      }
    } catch (error) {
      console.error("Sign-in error:", error);
      setErrorMessage(
        error.response?.data?.message ||
          "An error occurred during sign-in. Please try again.",
      );
    }

    setIsLoading(false);
  };

  return (
    <div className="login-container">
      <RequestForm
        title="Sign In"
        formFields={[
          { name: "email", label: "Email or Mobile", type: "text" },
          { name: "password", label: "Password", type: "password" },
        ]}
        onSubmit={handleSubmit}
        cancelBtn={() => {}}
        isSignIn={true}
      />
    </div>
  );
}
