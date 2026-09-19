import { useState } from "react";


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
        className={`w-full pr-12 ${className}`}
      />


      <button
        type="button"
        onClick={() =>
          setShowPassword((previous) => !previous)
        }
        className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500 transition hover:text-[#173f35]"
        aria-label={
          showPassword
            ? hideLabel
            : showLabel
        }
        title={
          showPassword
            ? hideLabel
            : showLabel
        }
      >

        {showPassword ? (
          // Eye off
          <svg
            width="21"
            height="21"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 3l18 18" />
            <path d="M10.6 10.6a2 2 0 002.8 2.8" />
            <path d="M9.9 4.2A10.7 10.7 0 0112 4c5 0 9 4 10 8a11.8 11.8 0 01-2.1 4.1" />
            <path d="M6.6 6.6C4.4 8 2.8 10 2 12c1 4 5 8 10 8 1.5 0 2.9-.4 4.1-1" />
          </svg>
        ) : (
          // Eye
          <svg
            width="21"
            height="21"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
            <circle
              cx="12"
              cy="12"
              r="3"
            />
          </svg>
        )}

      </button>

    </div>
  );
}


export default PasswordInput;