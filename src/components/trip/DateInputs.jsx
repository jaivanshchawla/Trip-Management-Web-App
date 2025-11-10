import React from "react";

export const DateInputs = ({ formData, handleChange }) => (
  <div>
    <label className="block text-xs font-medium text-gray-700 mb-1">
      Start Date*
    </label>
    <input
      type="date"
      name="startDate"
      onClick={(e) => e.target.showPicker()}
      // keep the date as string, no timezone conversion
      value={
        formData.startDate
          ? typeof formData.startDate === "string"
            ? formData.startDate
            : new Date(formData.startDate).toISOString().split("T")[0]
          : ""
      }
      onChange={(e) =>
        handleChange({
          target: {
            name: "startDate",
            value: e.target.value, // preserve as plain 'YYYY-MM-DD' string
          },
        })
      }
      required
      className="w-full border border-gray-300 rounded-md p-2"
    />
  </div>
);
