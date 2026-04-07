import React from "react";
import { IoMdArrowBack } from "react-icons/io";
import { CiSearch } from "react-icons/ci";
import { RiFileExcel2Fill } from "react-icons/ri";
import "../../ComponentsCss/utils/Pagination/Pagination.css";

const Pagination = ({
  pagination,          
  onPageChange,        
//   onSearch,            
  onExport,            
  showSearch = true,
  showExport = false,
}) => {
  if (!pagination) return null;

  const { totalUsers, totalPages, currentPage } = pagination;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="pagination-container">
      {/* 🔍 SEARCH */}
      {/* {showSearch && (
        <div className="pagination-search">
          <CiSearch />
          <input
            type="text"
            placeholder="Search by Employee ID or Name"
            onChange={(e) => onSearch?.(e.target.value)}
          />
        </div>
      )} */}

      {/* 📊 INFO */}
      <div className="pagination-info">
        Showing page <b>{currentPage}</b> of <b>{totalPages}</b>  
        &nbsp;|&nbsp; Total Users: <b>{totalUsers}</b>
      </div>

      {/* ⏮️ PAGINATION CONTROLS */}
      <div className="pagination-controls">
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <IoMdArrowBack /> Prev
        </button>

        {pages.map((page) => (
          <button
            key={page}
            className={page === currentPage ? "active" : ""}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ))}

        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next <IoMdArrowBack style={{ transform: "rotate(180deg)" }} />
        </button>
      </div>

      {/* 📥 EXCEL EXPORT */}
      {showExport && (
        <button className="excel-btn" onClick={onExport}>
          <RiFileExcel2Fill size={20}  />
          {/* Export Excel */}
        </button>
      )}
    </div>
  );
};

export default Pagination;
