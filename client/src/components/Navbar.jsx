import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { Sun, Moon } from "lucide-react";

const tabs = [
  { name: "Problems", path: "/" },
  { name: "Contest", path: "/contest" },
  { name: "Discuss", path: "/discuss" },
  { name: "Interview", path: "/interview" },
];

const Navbar = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const hash = location.hash;

  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    /* 🎨 Navbar background defaults dark, transitions to soft gray on light mode */
    <nav className="sticky top-0 z-50 items-center px-6 shadow-md w-full bg-[#282828] light:bg-zinc-100 border-b border-zinc-800 light:border-zinc-200 transition-colors duration-300">
      <div className="flex items-center px-6 h-12.5 m-auto text-zinc-400 light:text-zinc-500 font-medium">
        
        {/* Logo Text */}
        <div className="w-1/12 font-bold text-amber-500 light:text-amber-600 tracking-wide">
          LeetCode
        </div>

        {/* Global Navigation Links */}
        <ul className="w-9/12 flex h-full gap-5 items-center">
          {tabs.map((tab) => {
            const isActive = currentPath === tab.path;
            return (
              <li key={tab.name} className="relative flex h-full items-center">
                <Link
                  to={tab.path}
                  className={`h-full flex items-center justify-center transition-colors duration-200 hover:text-zinc-100 light:hover:text-zinc-900 ${
                    isActive ? "text-zinc-100 light:text-zinc-900 font-bold" : ""
                  }`}
                >
                  {tab.name}
                </Link>
                {/* Underline Indicator Node */}
                {isActive && (
                  <div className="bg-zinc-100 light:bg-zinc-900 w-full h-0.5 absolute bottom-0 transition-colors duration-300"></div>
                )}
              </li>
            );
          })}
        </ul>

        {/* User Actions & Theme Toggle Controls */}
        <div className="w-2/12 h-full flex items-center justify-end gap-4">
          <div className="flex items-center gap-3 h-full">
            {!user ? (
              <>
                <Link
                  to="/auth#login"
                  className={`h-full flex items-center justify-center transition-colors duration-200 hover:text-zinc-100 light:hover:text-zinc-900 ${
                    currentPath === "/auth" && hash !== "#signup"
                      ? "text-zinc-100 light:text-zinc-900 font-bold"
                      : ""
                  }`}
                >
                  Login
                </Link>
                <span className="text-zinc-700 light:text-zinc-300 select-none">|</span>
                <Link
                  to="/auth#signup"
                  className={`h-full flex items-center justify-center transition-colors duration-200 hover:text-zinc-100 light:hover:text-zinc-900 ${
                    currentPath === "/auth" && hash === "#signup"
                      ? "text-zinc-100 light:text-zinc-900 font-bold"
                      : ""
                  }`}
                >
                  SignUp
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/profile"
                  className={`h-full flex items-center justify-center transition-colors duration-200 hover:text-zinc-100 light:hover:text-zinc-900 ${
                    currentPath === "/profile" ? "text-zinc-100 light:text-zinc-900 font-bold" : ""
                  }`}
                >
                  Profile
                </Link>
                <Link
                  to="/logout"
                  className="h-full flex items-center justify-center text-red-400 hover:text-red-500 light:text-red-600 light:hover:text-red-700 font-bold transition-colors"
                >
                  Logout
                </Link>
              </>
            )}
          </div>

          {/* Theme Toggler Button */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle application theme"
            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-200 bg-zinc-800/50 border border-zinc-700/50 transition-all active:scale-95 cursor-pointer shadow-md light:border-zinc-300 light:bg-zinc-200/60 light:text-zinc-600 light:hover:text-zinc-900"
          >
            {theme === "light" ? (
              <Moon className="w-[16px] h-[16px] text-indigo-600" />
            ) : (
              <Sun className="w-[16px] h-[16px] text-amber-400" />
            )}
          </button>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;