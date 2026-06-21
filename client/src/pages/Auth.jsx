import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axiosClient from "../utils/axiosClient";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext"; // 🚀 Imported your theme context hook

// Define the Zod Validation Schema
const authSchema = z.object({
  isSignup: z.boolean(),
  username: z.string().optional(),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().optional(),
}).superRefine(({ password, confirmPassword, isSignup }, ctx) => {
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
  const { user, setUser, loading } = useAuth();
  const { theme } = useTheme(); // Consuming string state token ('light' or 'dark')

  const initialIsSignup = location.hash === "#signup";
  const [isSignup, setIsSignup] = useState(initialIsSignup);
  const [apiError, setApiError] = useState(""); 
  
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
      isSignup: initialIsSignup, 
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Watch URL hashes to swap components state seamlessly
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
    return <div className="flex min-h-screen items-center justify-center text-zinc-100 light:text-zinc-800">Loading...</div>;
  }

  if (user) return <Navigate to="/" replace />;

  // Form Submit Handler
  const onSubmit = async (data) => {
    try {
      setApiError(""); 
      console.log("Validated Form Data:", data);
      
      const res = await axiosClient.post(isSignup ? "/users/signup" : "/users/login", data);
      
      if (res.status === 200 || res.status === 201) {
        setUser(res.data.user);
      }
    } catch (err) {
      console.error("Auth server error:", err);
      setApiError(err.response?.data?.message || "An authentication error occurred.");
    }
  };

  const toggleMode = () => {
    const nextMode = !isSignup;
    setIsSignup(nextMode);
    reset();
    navigate(nextMode ? "/auth#signup" : "/auth#login", { replace: true });
    setValue("isSignup", nextMode); 
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8 transition-colors duration-300">
      
      {/* 🎨 Card layout defaults to dark zinc styling, shifts cleanly to white on light mode */}
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-zinc-800 p-8 shadow-2xl border border-zinc-700/50 light:bg-white light:border-zinc-100 light:shadow-xl transition-colors duration-300">
        <div>
          <h2 className="text-center text-3xl font-extrabold tracking-tight text-zinc-100 light:text-zinc-900">
            {isSignup ? "Create your account" : "Welcome back"}
          </h2>
        </div>

        {/* Server Validation Rejections Box */}
        {apiError && (
          <div className="p-3 text-sm font-semibold text-red-400 bg-red-950/40 border border-red-900/50 rounded-lg light:bg-red-50 light:text-red-600 light:border-red-200">
            {apiError}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 rounded-md shadow-xs">
            
            {/* USERNAME FIELD (Signup Only) */}
            {isSignup && (
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1 light:text-zinc-700">Username</label>
                <input
                  type="text"
                  placeholder="codemaster99"
                  className={`block w-full px-3 py-2.5 border rounded-lg bg-zinc-900/50 text-zinc-100 border-zinc-700 focus:outline-none focus:ring-2 sm:text-sm transition-colors light:bg-white light:text-zinc-900 ${
                    errors.username ? "border-red-500 focus:ring-red-500" : "border-zinc-700 focus:ring-indigo-500 light:border-zinc-300"
                  }`}
                  {...register("username")}
                />
                {errors.username && <p className="mt-1 text-xs font-semibold text-red-400 light:text-red-500">{errors.username.message}</p>}
              </div>
            )}

            {/* EMAIL FIELD */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1 light:text-zinc-700">Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                className={`block w-full px-3 py-2.5 border rounded-lg bg-zinc-900/50 text-zinc-100 border-zinc-700 focus:outline-none focus:ring-2 sm:text-sm transition-colors light:bg-white light:text-zinc-900 ${
                  errors.email ? "border-red-500 focus:ring-red-500" : "border-zinc-700 focus:ring-indigo-500 light:border-zinc-300"
                }`}
                {...register("email")}
              />
              {errors.email && <p className="mt-1 text-xs font-semibold text-red-400 light:text-red-500">{errors.email.message}</p>}
            </div>

            {/* PASSWORD FIELD */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1 light:text-zinc-700">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className={`block w-full px-3 py-2.5 border rounded-lg bg-zinc-900/50 text-zinc-100 border-zinc-700 focus:outline-none focus:ring-2 sm:text-sm transition-colors light:bg-white light:text-zinc-900 ${
                  errors.password ? "border-red-500 focus:ring-red-500" : "border-zinc-700 focus:ring-indigo-500 light:border-zinc-300"
                }`}
                {...register("password")}
              />
              {errors.password && <p className="mt-1 text-xs font-semibold text-red-400 light:text-red-500">{errors.password.message}</p>}
            </div>

            {/* CONFIRM PASSWORD FIELD (Signup Only) */}
            {isSignup && (
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1 light:text-zinc-700">Confirm Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className={`block w-full px-3 py-2.5 border rounded-lg bg-zinc-900/50 text-zinc-100 border-zinc-700 focus:outline-none focus:ring-2 sm:text-sm transition-colors light:bg-white light:text-zinc-900 ${
                    errors.confirmPassword ? "border-red-500 focus:ring-red-500" : "border-zinc-700 focus:ring-indigo-500 light:border-zinc-300"
                  }`}
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword && <p className="mt-1 text-xs font-semibold text-red-400 light:text-red-500">{errors.confirmPassword.message}</p>}
              </div>
            )}
          </div>

          {/* SUBMIT BUTTON */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-md disabled:opacity-50 cursor-pointer active:scale-[0.99]"
            >
              {isSubmitting ? "Processing..." : isSignup ? "Sign Up" : "Sign In"}
            </button>
          </div>
        </form>

        {/* MODE TOGGLE INTERFACE */}
        <div className="text-center mt-6">
          <p className="text-sm text-zinc-400 light:text-zinc-600">
            {isSignup ? "Already have an account?" : "Don't have an account yet?"}{" "}
            <button
              type="button"
              onClick={toggleMode}
              disabled={isSubmitting}
              className="font-semibold text-indigo-400 hover:text-indigo-300 light:text-indigo-600 light:hover:text-indigo-500 underline bg-transparent cursor-pointer disabled:opacity-40"
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