import React, { createContext, useState, useCallback, useMemo } from "react";

export const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
  const [globalData, setGlobalData] = useState({
    userInfo: {
      employee_id: "",
      companyCode: "",
      job_roles: "",
    },
    month: new Date().getMonth()+1, // Based on your previous logic
    year: new Date().getFullYear(),
    payCycle: {
      startDate: null,
      endDate: null,
      periodKey: "",
    },
  });

  // 1. Wrap with useCallback so the function reference NEVER changes
  const updateUserInfo = useCallback((newInfo) => {
    setGlobalData((prevData) => ({
      ...prevData,
      userInfo: { ...prevData.userInfo, ...newInfo },
    }));
  }, []);

  // 2. Wrap with useCallback
  const updateDateFilters = useCallback((newMonth, newYear) => {
    setGlobalData((prevData) => ({
      ...prevData,
      month: newMonth,
      year: newYear,
    }));
  }, []);

  // 3. Wrap with useCallback AND add a safety bailout!
  const updatePayCycle = useCallback((newCycle) => {
    setGlobalData((prevData) => {
      // 🚨 SAFETY CHECK: If the periodKey is exactly the same, DO NOTHING!
      // This immediately kills any infinite loops.
      if (prevData.payCycle.periodKey === newCycle.periodKey) {
        return prevData; 
      }
      
      return {
        ...prevData,
        payCycle: { ...prevData.payCycle, ...newCycle },
      };
    });
  }, []);

  // 4. Memoize the entire context value object to prevent unnecessary child re-renders
  const contextValue = useMemo(() => ({
    globalData,
    updateUserInfo,
    updateDateFilters,
    updatePayCycle,
  }), [globalData, updateUserInfo, updateDateFilters, updatePayCycle]);

  return (
    <GlobalContext.Provider value={contextValue}>
      {children}
    </GlobalContext.Provider>
  );
};