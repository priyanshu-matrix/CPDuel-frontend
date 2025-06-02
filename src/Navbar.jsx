import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useEffect } from "react";

const navLinks = [
  { href: "/home", label: "Home" },
  { href: "/contest", label: "Contest" },
  { href: "/sheets", label: "Sheets" },
];

const Navbar = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const [userName, setUserName] = useState(null);

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

useEffect(() => {
  const fetchUserName = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found");
        setUserName("Guest");
        return;
      }
      
      const response = await fetch("http://localhost:3000/api/users/info", {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Check if data.name exists, otherwise look for username or other property
        setUserName(data.name);
      } else {
        console.error("API error:", data.message || "Unknown error");
        setUserName("User");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setUserName("User");
    }
  };

  // Fetch when component mounts and when profile is toggled
  if (isProfileOpen) {
    fetchUserName();
  }
}, [isProfileOpen]);

  return (
    <header className="bg-gray-900 border-b border-gray-800 shadow-sm">
      <nav className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link
          to="/home"
          className="flex items-center gap-2 text-2xl font-extrabold text-amber-400 tracking-wide hover:text-amber-300 transition"
        >
          CP Duel
        </Link>
        <div className="flex gap-8 items-center">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className="text-gray-200 font-medium hover:text-amber-400 transition px-2 py-1 rounded"
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={toggleProfile}
            className="text-gray-200 font-medium hover:text-amber-400 transition px-2 py-1 rounded"
          >
            Profile
          </button>
        </div>
      </nav>

      {/* Profile Sidebar */}
      {isProfileOpen && (
        <div className="fixed top-0 left-0 w-full h-full bg-black/50 backdrop-blur-sm z-50">
          <div className="absolute top-0 right-0 w-80 h-full bg-gray-800 p-4 shadow-xl">
            <button
              onClick={toggleProfile}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-300"
            >
              Close
            </button>
            <h2 className="text-2xl font-bold text-white mb-4">Profile</h2>
            {/* Add profile content here */}
            <p className="text-gray-300">
              {userName ? `Welcome, ${userName}!` : "Loading user data..."}
            </p>
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-4"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
