import React from "react";

export default function InputBox({
  label,
  name,
  type,
  placeholder,
  value,
  onChange = () => {},
  disabled = false,
  className = "",
}) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label
        htmlFor={name}
        className={`font-[500] text-xl text-[#9b172a] dark:text-white font-lato`}
      >
        {label}
      </label>
      <input
        type={type}
        name={name}
        id={name}
        placeholder={placeholder}
        className={`bg-white text-black text-lg font-inter px-3 py-2 border border-gray-300 rounded-lg focus:border-[#9b172a] focus:ring-2 focus:ring-red-200 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:focus:border-[#9b172a] dark:focus:ring-red-800 transition-colors duration-200`}
        onChange={onChange}
        value={value || ""}
        disabled={disabled}
      />
    </div>
  );
}
