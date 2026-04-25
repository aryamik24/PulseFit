import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">

      {/* NAVBAR (always visible) */}
      <Navbar />

      {/* PAGE CONTENT */}
      <main className="pt-24 pb-10 px-6">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>

    </div>
  );
}