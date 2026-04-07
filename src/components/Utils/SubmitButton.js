import React from "react";
import { FaSpinner } from "react-icons/fa";

// Accepts a "loading" prop to disable and show spinner
export default function SubmitButton({ loading, children, ...rest }) {
  return (
    <button
      {...rest}
      disabled={loading || rest.disabled}
      className={loading ? "loading" : rest.className || ""}
    >
      {loading ? (
        <>
          <FaSpinner className="spinner" /> {children || "Submitting..."}
        </>
      ) : (
        children
      )}
    </button>
  );
}
