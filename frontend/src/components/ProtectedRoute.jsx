import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }) {
  const location = useLocation();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 bg-[#faf7f2]">
        <div className="relative flex items-center justify-center">
          <div className="h-12 w-12 rounded-full border-2 border-[#e8ded2] border-t-[#3b2d24] animate-spin" />
          <span className="absolute font-serif text-sm font-bold text-[#3b2d24] italic">V</span>
        </div>
        <p className="text-xs uppercase tracking-[0.2em] text-[#8a735e] font-semibold">
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