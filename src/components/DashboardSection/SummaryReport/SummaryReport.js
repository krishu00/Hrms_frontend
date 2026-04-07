import React, { useState, useEffect } from "react";
import "./SummaryReport.css";
import DownloadIcon from "../../../Image/download_icon.png";
import dropDown from "../../../Image/arrow_drop_down.png";
import dropUp from "../../../Image/arrow_drop_up.png";
import leftArrow from "../../../Image/arrow_back.png";
import rightArrow from "../../../Image/arrow_forward.png";

const SummaryReport = ({ data, headers }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQueries, setSearchQueries] = useState({});
  const [dropdownState, setDropdownState] = useState({});
  const [dropdownSearch, setDropdownSearch] = useState({});
console.log("headers ----" ,headers);

  useEffect(() => {
    setTotalCount(getFilteredRows().length);
    setCurrentPage(1);
  }, [data, searchQueries]);

  const getFilteredRows = () => {
    return data.filter((row) => {
      return Object.keys(searchQueries).every((key) => {
        if (!searchQueries[key]) return true;
        return row[key]?.toString().toLowerCase().includes(searchQueries[key].toLowerCase());
      });
    });
  };

  const filteredRows = getFilteredRows();

  const startIndex = (currentPage - 1) * rowsPerPage;
  const displayedData = filteredRows.slice(startIndex, startIndex + rowsPerPage);

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(Number(event.target.value));
    setCurrentPage(1);
  };

  const handleSearchChange = (key, value) => {
    setSearchQueries((prevQueries) => ({
      ...prevQueries,
      [key]: value,
    }));
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleDropdownSearch = (key, value) => {
    setDropdownSearch((prevSearch) => ({
      ...prevSearch,
      [key]: value,
    }));
  };

  const toggleDropdown = (key) => {
    setDropdownState((prevState) => ({
      ...prevState,
      [key]: !prevState[key],
    }));
  };

  const getFilteredOptions = (headerKey) => {
    const allOptions = [...new Set(data.map(item => item[headerKey]?.toString()))].filter(Boolean);
    const searchValue = dropdownSearch[headerKey] || "";
    return allOptions.filter((option) =>
      option.toLowerCase().includes(searchValue.toLowerCase())
    );
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString;
      }
      return date.toLocaleDateString('en-GB', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="summary-report">
      {/* New wrapper div for horizontal scrolling */}
      <div className="table-scroll-wrapper">
        <table>
          <thead>
            <tr>
              {headers.map((header) => (
                <th key={header.key} className="header-cell">
                  <div className="header-content">
                    <span>{header.name}</span>
                    <button
                      className="dropdown-toggle"
                      onClick={() => toggleDropdown(header.key)}
                    >
                      <img
                        src={dropdownState[header.key] ? dropUp : dropDown}
                        alt="toggle-dropdown"
                        width="16"
                        height="16"
                      />
                    </button>
                  </div>
                  {dropdownState[header.key] && (
                    <div className="dropdown">
                      <input
                        type="text"
                        placeholder={`Search ${header.name}...`}
                        value={dropdownSearch[header.key] || ""}
                        onChange={(e) =>
                          handleDropdownSearch(header.key, e.target.value)
                        }
                      />
                      <ul className="dropdown-options">
                        <li onClick={() => {
                          handleSearchChange(header.key, "");
                          toggleDropdown(header.key);
                        }}>
                          -- All --
                        </li>
                        {getFilteredOptions(header.key).map((option, index) => (
                          <li
                            key={index}
                            onClick={() => {
                              handleSearchChange(header.key, option);
                              toggleDropdown(header.key);
                            }}
                          >
                            {option}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="summary-report-tbody">
            {displayedData.length > 0 ? (
              displayedData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {headers.map((header) => (
                    <td key={header.key} className="summary-report-body">
                      {header.key.includes('date') ? formatDate(row[header.key]) : row[header.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={headers.length} style={{ textAlign: 'center' }}>
                  No data to display.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div> {/* End of table-scroll-wrapper */}

      <div className="pagination">
        <div className="rows-per-page">
          <label htmlFor="rows-per-page" className="rows-per-page-row">
            Rows per page:{" "}
          </label>
          <select
            id="rows-per-page"
            value={rowsPerPage}
            onChange={handleRowsPerPageChange}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
          </select>
        </div>

        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <img className="Arrow_btn" src={leftArrow} alt="Previous" />
        </button>

        <span>{currentPage}</span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === Math.ceil(totalCount / rowsPerPage)}
        >
          <img className="Arrow_btn" src={rightArrow} alt="Next" />
        </button>
      </div>
    </div>
  );
};

export default SummaryReport;