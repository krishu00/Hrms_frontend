import React, { useEffect, useRef, useState } from "react";
import "../../../components/ComponentsCss/utils/AssetsForm/AssetsForm.css";
// bring in shared loader styles for SubmitButton
import "../../ComponentsCss/shared/loader.css";
import "../../ComponentsCss/Request/ApplyRequests/ApplyLeaveForm/ApplyLeaveForm.css";
// import { AiOutlineCaretDown, AiOutlineCaretUp } from "react-icons/ai";
import { useSubmitting } from "../useSubmitting";
import SubmitButton from "../SubmitButton";
const AssetsForm = (props) => {
  const [newAssetData, setNewAssetData] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const { isSubmitting, run } = useSubmitting();
  const [options, setOptions] = useState([
    "Mobile",
    "Telivision",
    "Radio",
    "Smart Watch",
    "Others",
  ]);
  // const toggleDropdown = () => {
  //   setIsDropdownOpen(!isDropdownOpen);
  // };

  // const closeButton = () => {
  //   setIsDropdownOpen(false);
  // };

  const handleInputChange = (e) => {
    var { name, value } = e.target;
    setInputValue(value);
    setNewAssetData((old) => {
      return {
        ...old,
        [name]: value,
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    run(async () => {
      // send the data; make sure getData returns a promise if async
      await props.getData({ newAssetData });
    });
  }
  return (
    <form className="assets-form" onSubmit={handleSubmit}>
      <div className="form-header">
        <h2>{props.heading}</h2>
      </div>

      <div className="form-body">
        <div className="form-left">
          <div className="form-group" id=" first-div">
            <input
              type="text"
              id="assetdrop"
              name={props.name}
              // value={formData.assetName}
              onChange={handleInputChange}
              placeholder="Select Asset Type"
              required
              list="data"
            />
            {inputValue.length > 0 && (
              <datalist id="data" type="text">
                {options.map((v, i) => (
                  <option key={i} value={v}></option>
                ))}
              </datalist>
            )}
          </div>

          {/* <div className="form-group " id="second-div">
            <input
              type="text"
              id="assetName"
              name="assetName"
              onChange={handleInputChange}
              placeholder="Asset Name"
              required
            />
          </div> */}
          {/* <div className="form-group " id="second-div">
           
            <input
              type="text"
            
              name="date"
              onChange={handleInputChange}
              onFocus={(e) => (e.target.type = "date")}
              onBlur={(e) => (e.target.type = "text")}
              placeholder="yyyy/mm/dd"
              required
            />
          </div> */}

          <div className="form-group" id="third-div">
            {/* {/ <label htmlFor="comments">Issue:</label> /} */}
            <textarea
              id="comments"
              name="reason"
              className="text_area"
              // value={formData.comments}
              onChange={handleInputChange}
              // rows="4"
              placeholder={props.placeholderVal}
            ></textarea>
          </div>
           <div className="hr btn_Submit">
        <SubmitButton type="submit" loading={isSubmitting}>
         Submit
        </SubmitButton>
        </div>
        </div>
       
      </div>

      <div className="form-footer">
        {/* <button type="cancel" className="cancel-btn">
          Cancel
        </button> */}
      
      </div>
    </form>
  );
};

export default AssetsForm;








// import React, { useState } from 'react';
// import '../../../components/ComponentsCss/utils/AssetsForm/AssetsForm.css';
// const AssetsForm = () => {
//   const [formData, setFormData] = useState({
//     category: '',
//     assetName: '',
//     isActive: false,
//     comments: '',
//   });

//   const dropdownOptions = [
//     'Category 1',
//     'Category2',
//     'Category 3',
//     'Category 4',
//     'Others',

//   ];

//  const handleInputChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData((prevData) => ({
//      ...prevData,
//      [name]: type === 'checkbox' ? checked : value,
//    }));
//  }; 

//  const handleSubmit = (e) => {
//     e.preventDefault();
//     console.log('Form submitted:', formData);
    
//  };

//   return (
//     <form className="assets-form" onSubmit={handleSubmit}>
//       <div className="form-header">
//         <h2>APPLY FOR REPAIRING OF ASSETS</h2> 
//       </div>

//       <div className="form-body">
//         <div className="form-left">
//           <div className="form-group" id=" first-div" >
//             <label htmlFor="category" className='category'>Category:</label>
//             <select
//               id="category"
//               name="category" 
//               value={formData.category}
//               onChange={handleInputChange}
//               required
//             >
//               <option value="" disabled>Select a category</option>
//               {dropdownOptions.map((option, index) => (
//                 <option key={index} value={option}>
//                   {option}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="form-group " id="second-div">
//             <label htmlFor="assetName">Asset Name:</label>
//             <input
//               type="text"
//               id="assetName"
//               name="assetName"
//               value={formData.assetName}
//               onChange={handleInputChange}
//               required
//             />
//           </div>

//           <div className="form-group" id="third-div">
//             <label htmlFor="comments">Issue:</label>
//             <textarea
//               id="comments"
//               name="comments"
//               value={formData.comments}
//               onChange={handleInputChange}
//               rows="4"
//             ></textarea>
//           </div>
//         </div>
//       </div>

//       <div className="form-footer">
//         <button type="cancel" className="cancel-btn">Cancel</button>
//         <button type="submit" className="submit-btn">Submit</button>
//       </div>
//     </form>
//   );
// };

// export default AssetsForm;