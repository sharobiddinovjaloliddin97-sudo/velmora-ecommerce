import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

function PasswordInput({
  className = "",
  showLabel = "Parolni ko‘rsatish",
  hideLabel = "Parolni yashirish",
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <input
        {...props}
        type={showPassword ? "text" : "password"}
        className={`w-full pr-11 ${className}`}
      />

      <button
        type="button"
        onClick={() => setShowPassword((prev) => !prev)}
        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#3b2d24] transition-colors p-1 focus:outline-none"
        aria-label={showPassword ? hideLabel : showLabel}
        title={showPassword ? hideLabel : showLabel}
      >
        {showPassword ? (
          <EyeOff className="w-4 h-4" />
        ) : (
          <Eye className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}

export default PasswordInput;