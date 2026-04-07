import React, { useState } from "react";
import "../../ComponentsCss/Team/Team.css";
import Reporties from "./MyTeam/Reporties";
import Attendance from "./MyTeam/Attendance";

export default function TeamsPanel() {
  const [activeTeamId, setActiveTeamId] = useState(null);

  const teams = [
    { id: "team_overview", name: "Team Reporties" },
    { id: "team_attendance", name: "Team Attendance" },
  ];

  const handleRowClick = (teamId) => {
    setActiveTeamId(teamId);
  };

  const renderTeamSection = () => {
    switch (activeTeamId) {
      case "team_overview":
        return <Reporties />; 
      case "team_attendance":
        return <Attendance />;

      default:
        return (
          <div className="team-content-placeholder">
            Select a team section from the left.
          </div>
        );
    }
  };

  return (
    <div className="teams-layout">
      <div className="teams-menu">
        <h1 className="teams-title">Teams Menu</h1>
        <table className="teams-table">
          <thead>
            <tr>
              <th className="teams-header">TEAM SECTION</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team) => (
              <tr
                key={team.id}
                onClick={() => handleRowClick(team.id)}
                style={{ cursor: "pointer" }}
              >
                <td className="teams-cell">{team.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="teams-content">{renderTeamSection()}</div>
    </div>
  );
}
