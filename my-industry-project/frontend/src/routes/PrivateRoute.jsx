import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  //If token exists allow access
  if (token) return children;

  //If not logged in redirect to login
  return <Navigate to="/" replace />;
};

export default PrivateRoute;
