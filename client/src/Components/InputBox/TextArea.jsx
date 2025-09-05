import React from "react";

export default function TextArea({
  label,
  name,
  rows, 
  placeholder,
  value,
  onChange,
}) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={name}
        className="font-[500] text-xl text-blue-600 dark:text-white font-lato"
      >
        {label}
      </label>
      <textarea
        name={name}
        id={name}
        rows={rows}
        placeholder={placeholder}
        className="bg-white text-black resize-none text-lg font-inter px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:focus:border-blue-400 dark:focus:ring-blue-800 transition-colors duration-200"
        onChange={onChange}
        value={value}
      />
    </div>
  );
}
