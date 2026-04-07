import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useAuth } from "../../ComponentsCss/Authentication/authentication";
import { FcLeave } from "react-icons/fc";
import {
  useNavigate,
  NavLink,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import {
  FaHome,
  FaUsers,
  FaTachometerAlt,
  FaCalendarAlt,
  FaChartBar,
  FaEnvelope,
  FaBars,
  FaTimes,
  FaUserCircle,
  FaCog,
  FaSignOutAlt,
  FaUser,
  FaDollarSign,
  FaRegCalendarAlt,
} from "react-icons/fa";
// import { MdAdminPanel } from "react-icons/md";
import { SiCashapp } from "react-icons/si";
import { MdEventAvailable } from "react-icons/md";
import { BiSolidCategory } from "react-icons/bi";
import { BsClockHistory } from "react-icons/bs";
import { AiOutlineCheckCircle } from "react-icons/ai";
import { MdOutlineSupervisorAccount } from "react-icons/md";
import { HiOutlineUserGroup } from "react-icons/hi";
import { RiAdminFill } from "react-icons/ri";
import "../../ComponentsCss/Dashboard/Dashboard.css";

// Components
import AttendanceDashboard from "../AttendanceDashboard/index";
import Request from "../../DashboardSection/Request/index";
import Users from "../Users";
import AdminPanel from "../AdminPanel/AdminPanel";
import CreateNewUser from "../ProfileComponent/CreateNewUser";
import CreateMultiUsers from "../ProfileComponent/CreateMultiUsers";
import ProfileComponent from "../ProfileComponent/ProfileComponent";
import EditUserDetails from "../ProfileComponent/EditUserDetails";
import SummaryReport from "../SummaryReport/SummaryReport";
import GroupSections from "../GroupsSection/GroupSections";
import DisplayGroupDetails from "../GroupsSection/DisplayGroupDetails";
import CreateNewGroup from "../GroupsSection/CreateNewGroup";
import EditGroup from "../GroupsSection/EditGroup";
import UserAttendance from "../UserAttendance/UserAttendance";
import Profile from "../Profile";
import Holidays from "../Holiydays/Holidays";
import WeeklyImport from "../Holiydays/weeklyImport";
import GeneralImport from "../Holiydays/generalImport";
import DefineLeaves from "../DefineLeaves/defineLeaves";
import NewUserSection from "../NewUserSection/NewUserSection";
import { Category } from "../Category/Category";
import SalaryComponent from "../GenerateSalaryComponent/DisplaySalary_requirment";
import SingleSalaryComponent from "../GenerateSalaryComponent/SalaryComponent/SalaryComponent";
import LeaveTemplate from "../DefineLeaveTemplate/LeaveTemplate";
import UserPayslip from "../UserPayslip/UserPayslip";
import TeamsPanel from "../Team/Team";
import MyPayslip from "../UserPayslip/MyPayslip";
import BulkCTCUpload from "../GenerateSalaryComponent/SalaryStructure/BulkCTCUpload";

function Dashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [name, setName] = useState("Anonymous");
  const [jobRoles, setJobRoles] = useState([]);
  console.log("jobRoles", jobRoles);

  const companyCode = Cookies.get("companyCode");
  const employeeId = Cookies.get("employee_id");

  // Fetch employee details
  useEffect(() => {
    if (employeeId && companyCode) {
      axios
        .get(
          `${process.env.REACT_APP_API_URL}/company/${companyCode}/employee/${employeeId}`,
          {
            withCredentials: true,
          },
        )
        .then((res) => setName(res.data.data.employee_details.name))
        .catch((err) => console.error(err));
    }
  }, [employeeId, companyCode]);

  // Fetch job roles
  useEffect(() => {
    const roles = Cookies.get("job_roles");
    if (roles) setJobRoles(JSON.parse(roles));
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isAdmin = jobRoles.includes("admin");
  const isUser = jobRoles.includes("user");
  const isSuperAdmin = jobRoles.includes("super admin");

  const sidebarItems = [
    {
      icon: <FaHome />,
      label: "Overview",
      path: "/dashboard/AttendanceDashboard",
      roles: [
        "admin",
        "user",
        "super admin",
        "Super Admin",
        "manager",
        "Admin",
        "Manager",
      ],
    },
    {
      icon: <FaUsers />,
      label: "Users",
      path: "/dashboard/users",
      roles: ["admin", "super admin", "Super Admin", "Admin"],
    },
    {
      icon: <AiOutlineCheckCircle />,
      label: "Attendance",
      path: "/dashboard/UserAttendance",
      roles: [
        "admin",
        "Admin",
        "user",
        "super admin",
        "manager",
        "Super Admin",
        "Manager",
      ],
    },
    {
      icon: <FaEnvelope />,
      label: "Request",
      path: "/dashboard/request",
      roles: [
        "admin",
        "Admin",
        "user",
        "super admin",
        "manager",
        "Super Admin",
        "Manager",
      ],
    },
    {
      icon: <HiOutlineUserGroup />,
      label: "Groups",
      path: "/dashboard/group",
      roles: ["admin", "Admin", "super admin", "Super Admin"],
    },
    {
      icon: <RiAdminFill />,
      label: "Admin Panel",
      path: "/dashboard/Admin-Panel",
      roles: ["admin", "Admin", "super admin", "Super Admin"],
    },
    {
      icon: <FaRegCalendarAlt />,
      label: "Leaves",
      path: "/dashboard/DefineLeaves",
      roles: ["admin", "Admin", "super admin", "Super Admin"],
    },
    {
      icon: <MdEventAvailable />,
      label: "Holidays",
      path: "/dashboard/Holidays",
      roles: ["admin", "Admin", "super admin", "Super Admin"],
    },
    {
      icon: <BiSolidCategory />,
      label: "Category",
      path: "/dashboard/categories",
      roles: ["admin", "Admin", "super admin", "Super Admin"],
    },
    {
      icon: <SiCashapp />,
      label: "Salary Comp.",
      path: "/dashboard/Salary",
      roles: ["admin", "Admin", "super admin", "Super Admin"],
    },
    {
      icon: <MdOutlineSupervisorAccount />,
      label: "My Team",
      path: "/dashboard/myTeam",
      roles: [
        "admin",
        "Admin",
        "super admin",
        "manager",
        "Super Admin",
        "Manager",
      ],
    },
  ].filter((item) => item.roles.some((role) => jobRoles.includes(role)));

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);
  const handleLogout = async () => await logout();

  const getCurrentSectionTitle = () => {
    const currentItem = sidebarItems.find((item) =>
      location.pathname.includes(item.path),
    );
    return currentItem ? currentItem.label : "Dashboard";
  };

  return (
    <div className="dashboard">
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        {isSidebarOpen ? <FaTimes /> : <FaBars />}
      </button>

      <div className={`sidebar ${isSidebarOpen ? "open" : "closed"}`}>
        <nav className="sidebar-nav">
          {sidebarItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-item ${isActive ? "active" : ""}`
              }
              onClick={() => setIsSidebarOpen(false)}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="main-content">
        <div className="top-bar">
          <h2>{getCurrentSectionTitle()}</h2>
          <div className="user-profile" ref={dropdownRef}>
            <div className="profile-icon-wrapper" onClick={toggleDropdown}>
              <FaUserCircle className="profile-icon" />
              <span className="user-name">
                {name} <br /> {employeeId}
              </span>
            </div>
            {isDropdownOpen && (
              <div className="profile-dropdown">
                <NavLink
                  to="/dashboard/userprofile"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <div className="dropdown-item">
                    <FaUser /> Profile
                  </div>
                </NavLink>
                <NavLink
                  to="/dashboard/mypayslip"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <div className="dropdown-item">
                    <FaDollarSign /> Salary
                  </div>
                </NavLink>

                <div className="dropdown-item">
                  <FaCog />
                </div>
                <div className="dropdown-item" onClick={handleLogout}>
                  <FaSignOutAlt /> Logout
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="content-area">
          <Routes>
            <Route
              path="AttendanceDashboard"
              element={<AttendanceDashboard />}
            />
            <Route path="UserAttendance" element={<UserAttendance />} />
            <Route path="request" element={<Request />} />
            <Route path="users" element={<Users />} />
            <Route path="users/Users" element={<NewUserSection />} />
            <Route path="users/profile" element={<ProfileComponent />} />
            <Route path="users/edit-users" element={<NewUserSection />} />
            {/* <Route path="/dashboard/users/:id" element={<ProfileComponent />} /> */}

            <Route path="group" element={<GroupSections />} />
            <Route path="groups/details" element={<DisplayGroupDetails />} />
            <Route path="groups/create_group" element={<CreateNewGroup />} />
            <Route path="groups/edit_group" element={<EditGroup />} />
            <Route path="Admin-Panel" element={<AdminPanel />} />
            <Route
              path="Admin-Panel/summary-report/:reportId"
              element={<SummaryReport />}
            />
            <Route path="DefineLeaves" element={<DefineLeaves />} />
            <Route path="defineLeaves/template" element={<LeaveTemplate />} />
            <Route path="Holidays" element={<Holidays />} />
            <Route path="HolidayS/general-import" element={<GeneralImport />} />
            <Route path="HolidayS/weekly-import" element={<WeeklyImport />} />
            <Route path="categories" element={<Category />} />
            <Route path="Salary" element={<SalaryComponent />} />
            <Route path="Salary/bulk-ctc-upload" element={<BulkCTCUpload />} />
            <Route
              path="salary-components/add"
              element={<SingleSalaryComponent />}
            />
            <Route path="myTeam" element={<TeamsPanel />} />

            <Route path="userprofile" element={<Profile />} />
            <Route path="userpayslip" element={<UserPayslip />} />
            <Route path="*" element={<AttendanceDashboard />} />
            <Route path="mypayslip" element={<MyPayslip />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
