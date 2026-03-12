import { Navigate } from "react-router-dom";

export default function NotFound() {
  return <Navigate to="/404" replace />;
}