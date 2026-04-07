import React, { useState } from "react";
import "../../../ComponentsCss/AdminPanel/CompanyPolicies/CompanyPolicies.css";
import "../../../ComponentsCss/AdminPanel/ReportsComponent/OtherReports.css";
import { IoArrowBackOutline } from "react-icons/io5";

const OtherReports = () => {
  const [showList , setShowList] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    task: "",
    description: "",
    percentage: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    if (!formData.task) return;

    if (editId) {
      // UPDATE
      setTasks(
        tasks.map((item) =>
          item.id === editId ? { ...item, ...formData } : item
        )
      );
    } else {
      // ADD
      setTasks([...tasks, { ...formData, id: Date.now() }]);
    }

    closePopup();
    
  };

  const handleEdit = (item) => {
    setFormData(item);
    setEditId(item.id);
    setShowPopup(true);
    setShowList(false);
  };

  const handleDelete = (id) => {
    setTasks(tasks.filter((item) => item.id !== id));
  };

  const closePopup = () => {
    setFormData({ task: "", description: "", percentage: "" });
    setEditId(null);
    setShowPopup(false);
    setShowList(true);
  };

  return (
    <div className="company-policies-container">
        {showList && ( 
      <div className="outer-table-policy-cotainer">
        <div className="Uper-heading-company-policy">
          <h2>Task List</h2>
        </div>
       <div className="add-policy-button-container">
            <button type="button" className="global-btn add-policy-button" onClick={() => {setShowPopup(true) 
                 setShowList(false)}}>
                Add Task
            </button>
          </div>
        <div className="policy-table-container">
          <table className="company-policy-table">
            <thead>
              <tr>
                <th>Sr.no.</th>
                <th>Task</th>
                <th>Description</th>
                <th>Done %</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan="4">No Tasks Added</td>
                </tr>
              ) : (
                tasks.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>  
                    <td>{item.task}</td>
                    <td>{item.description}</td>
                    <td>{item.percentage}%</td>
                    <td>
                      <button
                        className="company-policy-button"
                        onClick={() => handleEdit(item)}
                      >
                        Edit/
                      </button>
                      <button
                        className="company-policy-button "
                        onClick={() => handleDelete(item.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
     </div>
)}

      {/* Popup */}
      {showPopup && (
        <div className="company-container-2">
         <div className="heading-company-policy">
                     <button
                       className="company-policy-back-button"
                       onClick={() => {
                            closePopup(); 
                       }}
                     >
                       <IoArrowBackOutline />
                     </button>
                     <h3 className="company-policy-title">
                       {editId ? "Edit Task" : "Add Task"}</h3>
                  </div>
            <div className="add-form">
                <div>
            <label>Task</label>
            <input name="task" value={formData.task} onChange={handleChange} />
            </div>
            <div>
            <label>Description</label>
            <input
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
            </div>
            <div>

            <label>Done Percentage</label>
            <input
              type="number"
              name="percentage"
              value={formData.percentage}
              onChange={handleChange}
            />
            </div>
            </div>

            <div className="add-form-buttons">
              <button className="global-btn" onClick={handleSave}>
                {editId ? "Update" : "Save"}
              </button>
              <button className="global-btn dlt" onClick={closePopup}>
                Cancel
              </button>
            </div>
          </div>
        
      )}
</div>
  );
};

export default OtherReports;
