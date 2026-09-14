import React from "react";

interface Team {
  position: number;
  name: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

interface LeagueTableProps {
  teams: Team[];
  title?: string;
}

export default function LeagueTable({
  teams,
  title = "Classificação",
}: LeagueTableProps) {
  return React.createElement(
    "div",
    { className: "rounded-lg shadow-md overflow-hidden" },
    // Header
    React.createElement(
      "div",
      { className: "bg-blue-50 border-b-2 border-blue-200 p-4" },
      React.createElement("h3", { className: "text-xl font-bold text-blue-900" }, title)
    ),

    // Table
    React.createElement(
      "div",
      { className: "overflow-x-auto" },
      React.createElement(
        "table",
        { className: "w-full" },
        // Header
        React.createElement(
          "thead",
          { className: "bg-blue-50 border-b border-blue-200" },
          React.createElement(
            "tr",
            {},
            React.createElement(
              "th",
              {
                className:
                  "px-4 py-3 text-left text-sm font-bold text-gray-900",
              },
              "Pos"
            ),
            React.createElement(
              "th",
              {
                className:
                  "px-4 py-3 text-left text-sm font-bold text-gray-900",
              },
              "Time"
            ),
            React.createElement(
              "th",
              {
                className:
                  "px-4 py-3 text-center text-sm font-bold text-gray-900",
              },
              "P"
            ),
            React.createElement(
              "th",
              {
                className:
                  "px-4 py-3 text-center text-sm font-bold text-gray-900",
              },
              "V"
            ),
            React.createElement(
              "th",
              {
                className:
                  "px-4 py-3 text-center text-sm font-bold text-gray-900",
              },
              "E"
            ),
            React.createElement(
              "th",
              {
                className:
                  "px-4 py-3 text-center text-sm font-bold text-gray-900",
              },
              "D"
            ),
            React.createElement(
              "th",
              {
                className:
                  "px-4 py-3 text-center text-sm font-bold text-gray-900",
              },
              "GP"
            ),
            React.createElement(
              "th",
              {
                className:
                  "px-4 py-3 text-center text-sm font-bold text-gray-900",
              },
              "GC"
            ),
            React.createElement(
              "th",
              {
                className:
                  "px-4 py-3 text-center text-sm font-bold text-gray-900",
              },
              "SG"
            ),
            React.createElement(
              "th",
              {
                className:
                  "px-4 py-3 text-center text-sm font-bold text-gray-900",
              },
              "Pts"
            )
          )
        ),

        // Body
        React.createElement(
          "tbody",
          {},
          teams.map((team, idx) =>
            React.createElement(
              "tr",
              {
                key: idx,
                className:
                  idx % 2 === 0
                    ? "bg-white border-b hover:bg-blue-50"
                    : "bg-gray-50 border-b hover:bg-blue-50",
              },
              React.createElement(
                "td",
                { className: "px-4 py-3 text-sm font-bold text-gray-900" },
                team.position
              ),
              React.createElement(
                "td",
                { className: "px-4 py-3 text-sm font-medium text-gray-900" },
                team.name
              ),
              React.createElement(
                "td",
                {
                  className:
                    "px-4 py-3 text-sm text-center text-gray-600",
                },
                team.played
              ),
              React.createElement(
                "td",
                {
                  className:
                    "px-4 py-3 text-sm text-center text-green-600 font-bold",
                },
                team.wins
              ),
              React.createElement(
                "td",
                {
                  className:
                    "px-4 py-3 text-sm text-center text-gray-600 font-bold",
                },
                team.draws
              ),
              React.createElement(
                "td",
                {
                  className:
                    "px-4 py-3 text-sm text-center text-red-600 font-bold",
                },
                team.losses
              ),
              React.createElement(
                "td",
                {
                  className:
                    "px-4 py-3 text-sm text-center text-gray-600",
                },
                team.goalsFor
              ),
              React.createElement(
                "td",
                {
                  className:
                    "px-4 py-3 text-sm text-center text-gray-600",
                },
                team.goalsAgainst
              ),
              React.createElement(
                "td",
                {
                  className:
                    "px-4 py-3 text-sm text-center text-gray-900 font-bold",
                },
                team.goalsFor - team.goalsAgainst
              ),
              React.createElement(
                "td",
                {
                  className:
                    "px-4 py-3 text-sm text-center font-bold text-blue-900 bg-blue-50",
                },
                team.points
              )
            )
          )
        )
      )
    )
  );
}