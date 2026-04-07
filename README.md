HRMS Frontend

A modern, full-featured Human Resource Management System frontend built with React. Designed to help HR teams manage employees, payroll, attendance, leaves, and company structure — all from a single dashboard.


🚀 Tech Stack
LayerTechnologyFrameworkReact 18RoutingReact Router DOMState ManagementRedux Toolkit / Context APIStylingTailwind CSS / CSS ModulesHTTP ClientAxiosUI ComponentsCustom ComponentsBuild ToolVite / Create React AppLanguageJavaScript (ES6+)

📦 Prerequisites
Before you begin, make sure you have the following installed:

Node.js v18 or higher
npm v9 or higher
The HRMS Backend running locally or on a server


⚙️ Installation & Setup
1. Clone the repository
bashgit clone https://github.com/krishu00/Hrms_frontend.git
cd Hrms_frontend
2. Install dependencies
bashnpm install
3. Configure environment variables
Create a .env file in the root of the project:
envREACT_APP_API_BASE_URL=http://localhost:5000/api

Replace http://localhost:5000/api with your actual backend URL.

4. Start the development server
bashnpm start
The application will open at http://localhost:3000

📁 Project Structure
Hrms_frontend/
├── public/                  # Static assets (favicon, index.html)
├── src/
│   ├── components/          # Reusable UI components
│   ├── pages/               # Full page views (one per route)
│   ├── services/            # Axios API call functions
│   ├── store/               # Redux store / Context providers
│   ├── utils/               # Helper functions
│   ├── App.jsx              # Root component with routing
│   └── main.jsx             # Entry point
├── .env                     # Environment variables (not committed)
├── package.json
└── README.md

🖥️ Key Features

Employee Management — Add, edit, view, and deactivate employee profiles
CTC & Salary Structure — Create and manage salary templates with auto-calculated component breakups
Bulk CTC Upload — Upload Excel files to set CTC for multiple employees at once
Payroll Calculation — Dynamic payroll engine with attendance-based pro-ration
Attendance Management — Track employee attendance and calculate LOP days
Leave Management — Apply, approve, and track leaves
Company Management — Multi-company support with company codes


🔗 Backend Repository
This frontend connects to the HRMS Backend (Node.js + Express + MongoDB).
Make sure the backend is running before starting the frontend.

🛠️ Available Scripts
CommandDescriptionnpm startStart development server at localhost:3000npm run buildBuild for productionnpm testRun test suite

👤 Author
Krishna — @krishu00

📄 License
This project is private. All rights reserved.