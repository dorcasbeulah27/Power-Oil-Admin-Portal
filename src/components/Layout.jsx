import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaBullhorn,
  FaMapMarkerAlt,
  FaGift,
  FaChartBar,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaCog,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

const Layout = ({ children }) => {
  const location = useLocation();
  const { admin, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", path: "/", icon: FaHome },
    { name: "Campaigns", path: "/campaigns", icon: FaBullhorn },
    { name: "Locations", path: "/locations", icon: FaMapMarkerAlt },
    { name: "Prizes", path: "/prizes", icon: FaGift },
    { name: "Prize Rules", path: "/prize-rules", icon: FaCog },
    { name: "Reports", path: "/reports", icon: FaChartBar },
  ];

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-admin-primary to-admin-secondary text-white transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="relative flex items-center justify-center px-6 py-6 border-b border-white/10">
            <img
              src="/src/header-img.png"
              alt="Power Oil Admin"
              className="h-24 object-contain"
            />
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute right-6 lg:hidden text-white hover:text-gray-200"
            >
              <FaTimes size={24} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? "bg-white/20 text-white"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile & Logout */}
          <div className="px-4 py-4 border-t border-white/10">
            <div className="px-4 py-3 bg-white/10 rounded-lg mb-2">
              <p className="text-sm font-semibold text-white">
                {admin?.fullName}
              </p>
              <p className="text-xs text-white/70">{admin?.role}</p>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-3 w-full px-4 py-3 text-white/70 hover:bg-white/10 hover:text-white rounded-lg transition-colors"
            >
              <FaSignOutAlt size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default Layout;
