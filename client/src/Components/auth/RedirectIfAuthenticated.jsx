import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

/**
 * Component to redirect authenticated users away from auth pages (login/signup)
 * If user is logged in, redirect to home page
 * If user is not logged in, render the auth page
 */
export default function RedirectIfAuthenticated({ children }) {
  const { isLoggedIn } = useSelector((state) => state.auth);

  // If user is already logged in, redirect to home page
  if (isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  // If user is not logged in, render the auth page
  return children;
}
