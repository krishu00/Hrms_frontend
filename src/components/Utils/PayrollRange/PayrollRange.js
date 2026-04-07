export default function getPayrollDateRange(year, month, startDay, endDay) {
  // Ensure inputs are numbers to avoid string concatenation bugs
  const targetYear = Number(year);
  const targetMonth = Number(month); // 1–12 format
  const sDay = Number(startDay);
  const eDay = Number(endDay);

  let startDate;
  let endDate;

  if (sDay <= eDay) {
    // ---------------------------------------------------
    // SAME MONTH CYCLE (1–31, 4–20 etc)
    // ---------------------------------------------------
    startDate = new Date(Date.UTC(targetYear, targetMonth - 1, sDay));
    
    // 🔥 FIX: Find the actual max days in this specific month (e.g., Feb = 28)
    const maxDaysInMonth = new Date(Date.UTC(targetYear, targetMonth, 0)).getDate();
    
    // Safely use whichever is smaller: the policy endDay (31) OR the month's max days (28)
    const safeEndDay = Math.min(eDay, maxDaysInMonth);
    
    endDate = new Date(Date.UTC(targetYear, targetMonth - 1, safeEndDay));
  } else {
    // ---------------------------------------------------
    // CROSS-MONTH CYCLE (7–6, 26–25 etc)
    // ---------------------------------------------------
    startDate = new Date(Date.UTC(targetYear, targetMonth - 1, sDay));
    
    // 🔥 FIX: Find the max days in the *next* month to prevent cross-month overflows
    const nextMonth = targetMonth === 12 ? 1 : targetMonth + 1;
    const nextYear = targetMonth === 12 ? targetYear + 1 : targetYear;
    const maxDaysInNextMonth = new Date(Date.UTC(nextYear, nextMonth, 0)).getDate();
    
    const safeEndDay = Math.min(eDay, maxDaysInNextMonth);
    
    // Date.UTC safely handles month overflow (e.g., month 12 automatically becomes Jan next year)
    endDate = new Date(Date.UTC(targetYear, targetMonth, safeEndDay));
  }

  return {
    startDate: startDate.toISOString().split("T")[0],
    endDate: endDate.toISOString().split("T")[0],
  };
}