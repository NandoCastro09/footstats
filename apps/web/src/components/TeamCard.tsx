import React from "react";
import Button from "./Button";

interface TeamCardProps {
  name: string;
  position: number;
  points: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
}

export default function TeamCard({
  name,
  position,
  points,
  wins,
  draws,
  losses,
  goalsFor,
  goalsAgainst,
}: TeamCardProps) {
  return React.createElement(
    "div",
    {
      className:
        "rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer",
    },
    // Header
    React.createElement(
      "div",
      {
        className:
          "h-24 bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center",
      },
      React.createElement(
        "div",
        {
          className:
            "w-16 h-16 rounded-full bg-white flex items-center justify-center text-2xl font-bold text-blue-600",
        },
        name.charAt(0)
      )
    ),

    // Content
    React.createElement(
      "div",
      { className: "p-6 bg-white" },
      // Title
      React.createElement(
        "h3",
        { className: "text-xl font-bold text-gray-900 mb-2" },
        name
      ),
      React.createElement(
        "p",
        { className: "text-sm text-gray-600 mb-4" },
        `Posição: #${position}`
      ),

      // Stats Grid
      React.createElement(
        "div",
        { className: "grid grid-cols-2 gap-3 mb-4" },
        // Pontos
        React.createElement(
          "div",
          { className: "bg-blue-50 rounded p-2" },
          React.createElement(
            "p",
            { className: "text-xs text-gray-600 uppercase" },
            "Pontos"
          ),
          React.createElement(
            "p",
            { className: "text-lg font-bold text-gray-900" },
            points
          )
        ),
        // V-E-D
        React.createElement(
          "div",
          { className: "bg-green-50 rounded p-2" },
          React.createElement(
            "p",
            { className: "text-xs text-gray-600 uppercase" },
            "V-E-D"
          ),
          React.createElement(
            "p",
            { className: "text-lg font-bold text-gray-900" },
            `${wins}-${draws}-${losses}`
          )
        ),
        // Gols Pró
        React.createElement(
          "div",
          { className: "bg-green-50 rounded p-2" },
          React.createElement(
            "p",
            { className: "text-xs text-gray-600 uppercase" },
            "Gols Pró"
          ),
          React.createElement(
            "p",
            { className: "text-lg font-bold text-green-600" },
            goalsFor
          )
        ),
        // Gols Contra
        React.createElement(
          "div",
          { className: "bg-red-50 rounded p-2" },
          React.createElement(
            "p",
            { className: "text-xs text-gray-600 uppercase" },
            "Gols Contra"
          ),
          React.createElement(
            "p",
            { className: "text-lg font-bold text-red-600" },
            goalsAgainst
          )
        )
      ),

      // Button
      <Button variant="primary" size="md" className="w-full">
        Ver Detalhes
      </Button>
    )
  );
}