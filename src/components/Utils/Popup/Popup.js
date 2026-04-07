import React from "react";
import { usePopup } from "../../../context/popup-context/Popup";
import "../../ComponentsCss/Popup/Popup.css"

export const Popup = () => {
  const { message } = usePopup();
  return (
    <div className="toast">
      <p> {message} </p>
    </div>
  );
};
