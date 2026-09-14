import React from "react";
import Badge from "./Badge";

interface MatchCardProps {
  team1: string;
  team2: string;
  score1: number;
  score2: number;
  status: "live" | "finished" | "scheduled";
  time?: string;
}

export default function MatchCard({
  team1,
  team2,
  score1,
  score2,
  status,
  time = "19:45",
}: MatchCardProps) {
  const statusColors = {
    live: "bg-orange-50 border-orange-500",
    finished: "bg-white border-gray-200",
    scheduled: "bg-blue-50 border-blue-200",
  };

  const statusBadges = {
    live: <Badge variant="live">AO VIVO</Badge>,
    finished: <Badge variant="default">ENCERRADO</Badge>,
    scheduled: <Badge variant="warning">{time}</Badge>,
  };

  return React.createElement(
    "div",
    {
      className: `rounded-lg shadow-sm border p-4 transition-all duration-200 hover:shadow-md cursor-pointer ${statusColors[status]}`,
    },
    React.createElement(
      "div",
      { className: "flex items-center justify-between" },
      // Time 1
      React.createElement(
        "div",
        { className: "flex flex-col items-center gap-2 flex-1" },
        React.createElement(
          "div",
          {
            className:
              "w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold",
          },
          team1.charAt(0)
        ),
        React.createElement(
          "p",
          { className: "text-sm font-medium text-gray-900" },
          team1
        )
      ),

      // Placar
      React.createElement(
        "div",
        { className: "flex flex-col items-center gap-2" },
        React.createElement(
          "p",
          { className: "text-3xl font-bold text-gray-900" },
          `${score1} - ${score2}`
        ),
        statusBadges[status]
      ),

      // Time 2
      React.createElement(
        "div",
        { className: "flex flex-col items-center gap-2 flex-1" },
        React.createElement(
          "div",
          {
            className:
              "w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-white font-bold",
          },
          team2.charAt(0)
        ),
        React.createElement(
          "p",
          { className: "text-sm font-medium text-gray-900" },
          team2
        )
      )
    )
  );
}