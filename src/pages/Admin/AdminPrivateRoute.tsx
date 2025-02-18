import React from "react";
import { Navigate } from "react-router-dom";

interface AdminPrivateRouteProps {
  children: JSX.Element;
}

const AdminPrivateRoute: React.FC<AdminPrivateRouteProps> = ({ children }) => {
  const isAdmin = sessionStorage.getItem("isAdmin") === "true";
  return isAdmin ? children : <Navigate to="/admin/login" />;
};

export default AdminPrivateRoute;
