import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { FaLock, FaUser } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import poweroilImage from "../poweroil.png";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data) => {
    setLoading(true);
    const success = await login(data.username, data.password);
    setLoading(false);

    if (success) {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-admin-primary to-admin-secondary relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full h-full"
        >
          <img
            src={poweroilImage}
            alt="Power Oil Nigeria"
            className="w-full h-full object-cover"
          />
        </motion.div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
            <div className="flex flex-col items-center justify-center mb-8">
              <img
                src="/src/header-img.png"
                alt="Power Oil Admin"
                className="h-24 object-contain mx-auto"
              />
              <p className="text-gray-600 font-semibold mt-2">Admin Portal</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FaUser className="inline mr-2 text-admin-primary" />
                  Username
                </label>
                <input
                  type="text"
                  {...register("username", {
                    required: "Username is required",
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-admin-primary focus:border-admin-primary outline-none transition"
                  placeholder="Enter your username"
                />
                {errors.username && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.username.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FaLock className="inline mr-2 text-admin-primary" />
                  Password
                </label>
                <input
                  type="password"
                  {...register("password", {
                    required: "Password is required",
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-admin-primary focus:border-admin-primary outline-none transition"
                  placeholder="Enter your password"
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-3 rounded-lg font-bold text-white transition-all ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-admin-primary to-admin-secondary hover:shadow-lg"
                }`}
              >
                {loading ? "Logging in..." : "Login"}
              </motion.button>
            </form>

            {/* Footer */}
            <p className="text-center text-gray-500 text-sm mt-6">
              © 2024 Power Oil Nigeria
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
