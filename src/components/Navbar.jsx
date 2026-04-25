import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";

export default function Navbar() {
  const navigate = useNavigate();

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50">

      {/* GLASS BACKDROP */}
      <div className="backdrop-blur-xl bg-white/70 border-b border-gray-200">

        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

          {/* LOGO */}
          <div className="text-xl font-semibold tracking-tight">
            PulseFit
          </div>

          {/* NAV */}
         <div className="flex items-center gap-8 text-sm">
         <NavItem to="/" label="Home" />
          <NavItem to="/progress" label="Progress" />
          <NavItem to="/coach" label="Coach" />
          <NavItem to="/analytics" label="AI" />
          <NavItem to="/meals" label="Meals" />
          <NavItem to="/settings" label="Settings" />
          </div>

          {/* RIGHT */}
          <button
            onClick={logout}
            className="text-sm text-gray-500 hover:text-black transition"
          >
            Logout
          </button>

        </div>
      </div>

    </header>
  );
}

function NavItem({ to, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `relative transition ${
          isActive
            ? "text-black font-medium"
            : "text-gray-400 hover:text-black"
        }`
      }
    >
      {label}

      {/* UNDERLINE ANIMATION */}
      <span
        className={`absolute left-0 -bottom-1 h-[2px] w-full bg-black transition-transform ${
          location.pathname === to ? "scale-x-100" : "scale-x-0"
        }`}
      />
    </NavLink>
  );
}