import useAuth from "../context/useAuth";
import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children }) {
  const { user } = useAuth();
  console.log("user in PrivateRoute:", user);

  if (!user) return <Navigate to="/login" replace />;
  return children;
}
