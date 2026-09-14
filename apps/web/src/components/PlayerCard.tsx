import React from "react";
import Badge from "./Badge";

interface PlayerCardProps {
  name: string;
  position: string;
  number: number;
  height?: string;
  nationality?: string;
  goals?: number;
  assists?: number;
  injured?: boolean;
}

export default function PlayerCard({
  name,
  position,
  number,
  height = "1.82m",
  nationality = "Brasil",
  goals = 0,
  assists = 0,
  injured = false,
}: PlayerCardProps) {
  return React.createElement(
    "div",
    {
      className: `rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-200 ${
        injured ? "opacity-60" : ""
      }`,
    },
    React.createElement(
      "div",
      {
        className:
          "h-20 bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center relative",
      },
      React.createElement(
        "div",
        {
          className:
            "w-16 h-16 rounded-full bg-white flex items-center justify-center text-2xl font-bold text-blue-600 border-4 border-blue-500",
        },
        number
      )
    ),

    React.createElement(
      "div",
      { className: "p-4 bg-white" },
      React.createElement(
        "h3",
        { className: "text-lg font-bold text-gray-900 mb-1" },
        name
      ),
      React.createElement(
        "p",
        { className: "text-sm text-gray-600 mb-3" },
        position
      ),

      React.createElement(
        "div",
        { className: "flex gap-2 mb-3 flex-wrap" },
        <Badge variant="default">{height}</Badge>,
        <Badge variant="default">{nationality}</Badge>
      ),

      React.createElement(
        "div",
        { className: "grid grid-cols-2 gap-2 mb-3" },
        React.createElement(
          "div",
          { className: "bg-green-50 rounded p-2" },
          React.createElement(
            "p",
            { className: "text-xs text-gray-600 uppercase" },
            "Gols"
          ),
          React.createElement(
            "p",
            { className: "text-lg font-bold text-green-600" },
            goals
          )
        ),
        React.createElement(
          "div",
          { className: "bg-blue-50 rounded p-2" },
          React.createElement(
            "p",
            { className: "text-xs text-gray-600 uppercase" },
            "Assistências"
          ),
          React.createElement(
            "p",
            { className: "text-lg font-bold text-blue-600" },
            assists
          )
        )
      ),

      injured ? <Badge variant="error">LESIONADO</Badge> : null
    )
  );
}