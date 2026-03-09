import { Navigate, Outlet } from "react-router-dom";
import { tokenUtils } from "../utils/auth";

const isAuthenticated = () => !!localStorage.getItem("access_token")

export default function PrivateRouter({ redirectTo = "/login" }) {

    return isAuthenticated()? <Outlet /> : <Navigate to={redirectTo} replace />;
}