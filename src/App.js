import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./components/ComponentsCss/Authentication/authentication";
import Main from "./Main";
import { ModeProvider } from "./context/mode-context/mode-context";
import { PopupProvider } from "./context/popup-context/Popup";
import { GlobalProvider } from "./context/GlobalContext/GlobalContext";

function App() {
  return (
    <Router>
      <GlobalProvider>
        <AuthProvider>
          <ModeProvider>
            <PopupProvider>
              <Main />
            </PopupProvider>
          </ModeProvider>
        </AuthProvider>
      </GlobalProvider>
    </Router>
  );
}

export default App;
