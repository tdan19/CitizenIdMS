import React from "react";
import { FaArrowUp, FaArrowDown, FaEquals } from "react-icons/fa";

const SummaryCard = ({ icon, title, value, trend, trendValue }) => {
  const getTrendIndicator = () => {
    switch (trend) {
      case "up":
        return (
          <span className="flex items-center text-green-500 text-sm">
            <FaArrowUp className="mr-1" />
            {trendValue}
          </span>
        );
      case "down":
        return (
          <span className="flex items-center text-red-500 text-sm">
            <FaArrowDown className="mr-1" />
            {trendValue}
          </span>
        );
      default:
        return (
          <span className="flex items-center text-gray-500 text-sm">
            <FaEquals className="mr-1" />
            {trendValue || "No change"}
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow h-full">
      <div className="flex justify-between items-start h-full">
        <div className="flex flex-col h-full justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          {trend && <div className="mt-2">{getTrendIndicator()}</div>}
        </div>
        <div className="p-3 rounded-full bg-gray-100 ml-4">{icon}</div>
      </div>
    </div>
  );
};

export default SummaryCard;
