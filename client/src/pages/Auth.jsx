import { useState } from "react";
import { useForm } from "react-hook-form";
import axiosClient from "../utils/axiosClient.js";
import { useAuth } from "../context/AuthContext.jsx";

const Auth = () => {
  const [isSignup, setIsSignup] = useState(false);
  
  const { 
    register, 
    handleSubmit, 
    watch,
    reset,
    formState: { errors } 
  } = useForm();

  const { user } = useAuth();

  if (user) window.location.href = "/";

  const passwordValue = watch("password");

  const onSubmit = async (data) => {
    console.log("Validated Form Data:", data);
    const res = await axiosClient.post(isSignup ? "/users/signup" : "/users/login", data);
    if (res.status === 200) {
      window.location.href = "/";
    } else {
      console.error("Error:", res);
    }
  };

  const toggleMode = () => {
    setIsSignup(!isSignup);
    reset();
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl transition-all duration-300">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold tracking-tight text-gray-900">
            {isSignup ? "Create your account" : "Welcome back"}
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 rounded-md shadow-sm">
            
            {/* USERNAME FIELD */}
            {isSignup && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  placeholder="codemaster99"
                  className={`relative block w-full px-3 py-2.5 border ${
                    errors.username ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                  } placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 sm:text-sm transition-colors`}
                  {...register("username", { required: "Username is required" })}
                />
                {errors.username && <p className="mt-1 text-xs font-semibold text-red-500">{errors.username.message}</p>}
              </div>
            )}

            {/* EMAIL FIELD */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                className={`relative block w-full px-3 py-2.5 border ${
                  errors.email ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                } placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 sm:text-sm transition-colors`}
                {...register("email", { 
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address"
                  }
                })}
              />
              {errors.email && <p className="mt-1 text-xs font-semibold text-red-500">{errors.email.message}</p>}
            </div>

            {/* PASSWORD FIELD */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className={`relative block w-full px-3 py-2.5 border ${
                  errors.password ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                } placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 sm:text-sm transition-colors`}
                {...register("password", { 
                  required: "Password is required",
                  minLength: { value: 6, message: "Password must be at least 6 characters" }
                })}
              />
              {errors.password && <p className="mt-1 text-xs font-semibold text-red-500">{errors.password.message}</p>}
            </div>

            {/* CONFIRM PASSWORD FIELD */}
            {isSignup && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className={`relative block w-full px-3 py-2.5 border ${
                    errors.confirmPassword ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                  } placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 sm:text-sm transition-colors`}
                  {...register("confirmPassword", { 
                    required: "Please confirm your password",
                    validate: (value) => value === passwordValue || "Passwords do not match"
                  })}
                />
                {errors.confirmPassword && <p className="mt-1 text-xs font-semibold text-red-500">{errors.confirmPassword.message}</p>}
              </div>
            )}
          </div>

          {/* SUBMIT BUTTON */}
          <div>
            <button
              type="submit"
              className="group relative flex w-full justify-center rounded-lg border border-transparent bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all shadow-md active:scale-95"
            >
              {isSignup ? "Sign Up" : "Sign In"}
            </button>
          </div>
        </form>

        {/* TOGGLE LINK */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            {isSignup ? "Already have an account?" : "Don't have an account yet?"}{" "}
            <button
              type="button"
              onClick={toggleMode}
              className="font-medium text-indigo-600 hover:text-indigo-500 underline underline-offset-4 bg-transparent border-none p-0 cursor-pointer"
            >
              {isSignup ? "Log In" : "Register here"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;