import { createContext, useContext, useState } from "react";

const ModeContext = createContext();


const ModeProvider = ({children}) => {

    const [mode, setMode] = useState("create");

    return (
        <ModeContext.Provider value={{mode, setMode}}>
            {children}
        </ModeContext.Provider>
    )
}


const useMode = () => useContext(ModeContext);

export { useMode, ModeProvider }