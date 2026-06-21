import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const tabs = [
  { name: "Problems", path: "/problems" },
  { name: "Contest", path: "/contest" },
  { name: "Discuss", path: "/discuss" },
  { name: "Interview", path: "/interview" },
];

const Navbar = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const hash = location.hash;

  const { user } = useAuth();

  return (
    <nav className="navbar w-full bg-[#282828]">
      <div className="flex items-center px-6 h-12.5 m-auto text-[#8B8B8B]">
        <div className="w-1/12 text-yellow-200">Leetcode</div>
        <ul className="w-9/12 flex font-bold h-full gap-3">
          {tabs.map((tab) => (
            <li key={tab.name} className="relative flex hover:text-white">
              <Link
                to={tab.path}
                className="flex items-center"
                style={{ color: currentPath === tab.path && "#FFFFFF" }}
              >
                {tab.name}
              </Link>
              {currentPath === tab.path && (
                <div className="bg-white w-full h-0.5 absolute bottom-0"></div>
              )}
            </li>
          ))}
        </ul>
        <div className="w-2/12 h-full flex">
          <div className="flex gap-3 font-bold">
            {!user ? (
              <>
                <Link
                  to="/auth#login"
                  className="flex items-center hover:text-white"
                  style={{
                    color:
                      currentPath === "/auth" &&
                      hash !== "#signup" &&
                      "#FFFFFF",
                  }}
                >
                  Login
                </Link>
                <span className="mx-2 flex items-center">|</span>
                <Link
                  to="/auth#signup"
                  className="flex items-center hover:text-white"
                  style={{
                    color:
                      currentPath === "/auth" &&
                      hash === "#signup" &&
                      "#FFFFFF",
                  }}
                >
                  SignUp
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/profile"
                  className="flex items-center hover:text-white"
                  style={{ color: currentPath === "/profile" && "#FFFFFF" }}
                >
                  Profile
                </Link>
                <Link
                  to="/logout"
                  className="flex items-center text-red-600 hover:text-[#8B8B8B]"
                >
                  Logout
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
