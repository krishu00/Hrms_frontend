import axios from "axios";
import React, { useEffect, useState } from "react";
import "../../ComponentsCss/Category/Category.css";
import Button from "../../../context/GlobalButton/globalButton";
import {FaEye} from "react-icons/fa";

export const Category = () => {
  const [categories, setCategories] = useState({
    name: "",
    options: [],
  });

  const [data, setData] = useState([]);
  const [showAddOption, setShowAddOption] = useState(false);
  const [showEditOption, setShowEditOption] = useState(false);
  const [showDeleteOption, setShowDeleteOption] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentOption, setCurrentOption] = useState("");

  // Fetch all categories
  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/collection-category/get-categories`
      );
      setData(response.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleNameChange = (e) => {
    setCategories({
      ...categories,
      [e.target.name]: e.target.value,
    });
  };

  const handleOptionChange = (e) => {
    setCurrentOption(e.target.value);
  };

  const handleAddOption = (e) => {
    e.preventDefault();
    if (currentOption) {
      setCategories({
        ...categories,
        options: [...categories.options, currentOption],
      });
      setCurrentOption("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/collection-category/add-category`,
        categories,
        {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setCategories({ name: "", options: [] });
      fetchCategories(); // Refresh data
      setShowAddOption(false);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="category_outer_container">
      <Button
        text="Add Category"
        className="addCategoryButton"
        onClick={() => setShowAddOption(true)}
      ></Button>

      {/* Add Category Form */}
      {showAddOption && (
        <div className="categoryOverlay">
          <form className="addCategoryForm" onSubmit={handleSubmit}>
            <div>
              <button
                className="categoryCloseButton"
                onClick={() => setShowAddOption(false)}
              >
                X
              </button>
              <label>Name</label>
              <select
                name="name"
                value={categories.name}
                onChange={handleNameChange}
                required
              >
                <option value="">Select Category</option>
                <option value="department">Department</option>
                <option value="designation">Designation</option>
                <option value="role">Role</option>
                <option value="reportingmanager">Reporting Manager</option>
                <option value="jobrole">Job Role</option>
              </select>
            </div>
            <div>
              <label>Add Options</label>
              {categories.options.length > 0 && (
                <input value={categories.options.join(", ")} readOnly />
              )}
              <input
                type="text"
                name="options"
                value={currentOption}
                onChange={handleOptionChange}
              />
              <Button
                text="Add"
                className="add_buttons"
                onClick={handleAddOption}
              ></Button>
            </div>
            <input type="submit" value="Save" />
          </form>
        </div>
      )}

      {/* Table */}
      <div className="categoryTable">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Options</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((category, index) => (
              <tr key={index}>
                <td>{category.name}</td>
                <td>
                  <select className="categoryOptionSelect" >
                  <option value="-View👁️">-View👁️</option>
                  {category.options.map((option, i) => (
                    <option key={i} disabled>
                      {option}</option>
                  ))}
                  </select>
                </td>
                <td>
                  <button
                    className="editCategoryButton"
                    onClick={() => {
                      setSelectedCategory(category);
                      setShowEditOption(true);
                      setCurrentOption("");
                    }}
                  >
                    <span class="material-icons add">add_circle_outline</span>
                  </button>

                  <button
                    className="deleteCategoryButton"
                    onClick={() => {
                      setSelectedCategory(category);
                      setShowDeleteOption(true);
                      setCurrentOption("");
                    }}
                  >
                    <span class="material-icons add">delete</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Category Option */}
      {showEditOption && selectedCategory && (
        <div className="categoryOverlay">
          <form
            className="addCategoryForm"
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await axios.put(
                  `${process.env.REACT_APP_API_URL}/collection-category/update-option/${selectedCategory.name}`,
                  { newOption: currentOption }
                );
                setShowEditOption(false);
                setCurrentOption("");
                fetchCategories(); // Refresh data
              } catch (err) {
                console.log(err);
              }
            }}
          >
            <button
              className="categoryCloseButton"
              onClick={() => setShowEditOption(false)}
            >
              X
            </button>
            <div>
              <label>Name</label>
              <input value={selectedCategory.name} readOnly />
            </div>
            <div>
              <label>New Option</label>
              <input
                name="newOption"
                value={currentOption}
                onChange={handleOptionChange}
                required
              />
            </div>
            <input type="submit" value="Add & Save" />
          </form>
        </div>
      )}

      {/* Delete Option */}
      {showDeleteOption && selectedCategory && (
        <div className="categoryOverlay">
          <form
            className="addCategoryForm"
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await axios.delete(
                  `${process.env.REACT_APP_API_URL}/collection-category/delete-option/${selectedCategory.name}`,
                  { data: { optionToDelete: currentOption } }
                );
                setShowDeleteOption(false);
                setCurrentOption("");
                fetchCategories(); // Refresh data
              } catch (err) {
                console.log(err);
              }
            }}
          >
            <button
              className="categoryCloseButton"
              onClick={() => setShowDeleteOption(false)}
            >
              X
            </button>
            <div>
              <label>Name</label>
              <input value={selectedCategory.name} readOnly />
            </div>
            <div>
              <label>Option to Delete</label>
              <select
                value={currentOption}
                onChange={(e) => setCurrentOption(e.target.value)}
                required
              >
                <option value="">Select</option>
                {selectedCategory.options.map((option, idx) => (
                  <option key={idx} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <input type="submit" value="Delete & Save" />
          </form>
        </div>
      )}
    </div>
  );
};
