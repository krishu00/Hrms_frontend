import { createContext, useContext, useState } from "react";

const PopupContext = createContext();

const PopupProvider = ({children}) => {
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    return (
        <PopupContext.Provider value={{showPopup, setShowPopup, message, setMessage}}>
            {children}
        </PopupContext.Provider>
    )
};


const usePopup = () => useContext(PopupContext);

export { PopupProvider, usePopup };
