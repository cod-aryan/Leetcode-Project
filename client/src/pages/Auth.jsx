import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axiosClient from "../utils/axiosClient";
import { Navigate, useLocation, useNavigate } from "react-router-dom"; // 🛠️ Snagged useLocation and useNavigate
import { useAuth } from "../context/AuthContext";

// Define the Zod Validation Schema
const authSchema = z.object({
  isSignup: z.boolean(),
  username: z.string().optional(),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().optional(),
}).superRefine(({ password, confirmPassword, isSignup }, ctx) => {
  // Custom structural validation for matching passwords during signup
  if (isSignup && confirmPassword !== password) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Passwords do not match",
      path: ["confirmPassword"],
    });
  }
  if (isSignup && (!ctx.parent?.username || ctx.parent.username.trim() === "")) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Username is required for registration",
      path: ["username"],
    });
  }
});

const Auth = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Clean initialization checking if the hash matches signup right off the bat
  const initialIsSignup = location.hash === "#signup";
  const [isSignup, setIsSignup] = useState(initialIsSignup);
  const [apiError, setApiError] = useState(""); // Captures bad credentials or network issues
  
  const { user, setUser, loading } = useAuth();

  // Initialize useForm with the Zod Resolver
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(authSchema),
    defaultValues: {
      isSignup: initialIsSignup, // 🛠️ Syncing this with the initial URL state setup
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // 🛠️ Listening to location.hash from our React Router hook ensures this triggers on every URL change
  useEffect(() => {
    if (location.hash === "#signup") {
      setIsSignup(true);
      setValue("isSignup", true);
    } else {
      setIsSignup(false);
      setValue("isSignup", false);
    }
  }, [location.hash, setValue]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  if (user) return <Navigate to="/" replace />;

  // Form Submit Callback
  const onSubmit = async (data) => {
    try {
      setApiError(""); // Clear the deck of old errors
      console.log("Validated Form Data:", data);
      
      const res = await axiosClient.post(isSignup ? "/users/signup" : "/users/login", data);
      
      if (res.status === 200 || res.status === 201) {
        setUser(res.data.user);
      }
    } catch (err) {
      // Catch bad login responses gracefully without crashing the view
      console.error("Auth server error:", err);
      setApiError(err.response?.data?.message || "An authentication error occurred.");
    }
  };

  // 🛠️ Updated to synchronize the URL hash whenever the button is pressed
  const toggleMode = () => {
    const nextMode = !isSignup;
    setIsSignup(nextMode);
    reset();
    
    // Smoothly flip the URL bar to match the interface mode
    navigate(nextMode ? "/auth#signup" : "/auth#login", { replace: true });
    setValue("isSignup", nextMode); 
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-gray-50">
      {/* Changed bg-transparent to bg-white so the shadow-xl container is actually visible */}
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl border border-gray-100">
        <div>
          <h2 className="text-center text-3xl font-extrabold tracking-tight text-gray-900">
            {isSignup ? "Create your account" : "Welcome back"}
          </h2>
        </div>

        {/* Display backend rejections dynamically */}
        {apiError && (
          <div className="p-3 text-sm font-semibold text-red-600 bg-red-50 rounded-lg border border-red-200">
            {apiError}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 rounded-md shadow-sm">
            
            {/* USERNAME FIELD (Signup Only) */}
            {isSignup && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  placeholder="codemaster99"
                  className={`block w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 sm:text-sm transition-colors ${
                    errors.username ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-indigo-500"
                  }`}
                  {...register("username")}
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
                className={`block w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 sm:text-sm transition-colors ${
                  errors.email ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-indigo-500"
                }`}
                {...register("email")}
              />
              {errors.email && <p className="mt-1 text-xs font-semibold text-red-500">{errors.email.message}</p>}
            </div>

            {/* PASSWORD FIELD */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className={`block w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 sm:text-sm transition-colors ${
                  errors.password ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-indigo-500"
                }`}
                {...register("password")}
              />
              {errors.password && <p className="mt-1 text-xs font-semibold text-red-500">{errors.password.message}</p>}
            </div>

            {/* CONFIRM PASSWORD FIELD (Signup Only) */}
            {isSignup && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className={`block w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 sm:text-sm transition-colors ${
                    errors.confirmPassword ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-indigo-500"
                  }`}
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword && <p className="mt-1 text-xs font-semibold text-red-500">{errors.confirmPassword.message}</p>}
              </div>
            )}
          </div>

          {/* SUBMIT BUTTON */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-md disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? "Processing..." : isSignup ? "Sign Up" : "Sign In"}
            </button>
          </div>
        </form>

        {/* MODE TOGGLE */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            {isSignup ? "Already have an account?" : "Don't have an account yet?"}{" "}
            <button
              type="button"
              onClick={toggleMode}
              className="font-medium text-indigo-600 hover:text-indigo-500 underline bg-transparent cursor-pointer"
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