import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";


function ProtectedRoute({ children }) {
  const location = useLocation();

  const {
    user,
    loading,
  } = useAuth();


  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-stone-500">
          Yuklanmoqda...
        </p>
      </div>
    );
  }


  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }


  return children;
}


export default ProtectedRoute;