// src/components/Navbar.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  isScrolled: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ isScrolled }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-md py-2" : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="relative h-10 w-40">
              <Image
                src={
                  isScrolled
                    ? "/images/logo-dark.svg"
                    : "/images/logo-light.svg"
                }
                alt="HealthPaySecure"
                fill
                className="object-contain"
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <div className="relative group">
              <button
                className={`flex items-center space-x-1 ${
                  isScrolled ? "text-gray-800" : "text-white"
                } hover:text-blue-400 transition-colors`}
              >
                <span>Solutions</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              <div className="absolute left-0 mt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2">
                <div className="bg-white rounded-lg shadow-xl p-4 border border-gray-100">
                  <Link
                    href="/solutions/providers"
                    className="block px-4 py-2 text-gray-800 hover:bg-blue-50 hover:text-blue-700 rounded-md"
                  >
                    For Healthcare Providers
                  </Link>
                  <Link
                    href="/solutions/patients"
                    className="block px-4 py-2 text-gray-800 hover:bg-blue-50 hover:text-blue-700 rounded-md"
                  >
                    For Patients
                  </Link>
                  <Link
                    href="/solutions/insurance"
                    className="block px-4 py-2 text-gray-800 hover:bg-blue-50 hover:text-blue-700 rounded-md"
                  >
                    For Insurance Companies
                  </Link>
                </div>
              </div>
            </div>
            <Link
              href="/features"
              className={`${
                isScrolled ? "text-gray-800" : "text-white"
              } hover:text-blue-400 transition-colors`}
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className={`${
                isScrolled ? "text-gray-800" : "text-white"
              } hover:text-blue-400 transition-colors`}
            >
              Pricing
            </Link>
            <Link
              href="/about"
              className={`${
                isScrolled ? "text-gray-800" : "text-white"
              } hover:text-blue-400 transition-colors`}
            >
              About Us
            </Link>
            <Link
              href="/contact"
              className={`${
                isScrolled ? "text-gray-800" : "text-white"
              } hover:text-blue-400 transition-colors`}
            >
              Contact
            </Link>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              className={
                isScrolled
                  ? "bg-blue-700 text-white hover:bg-blue-800"
                  : "bg-white text-blue-700 hover:bg-blue-50 hover:text-blue-800"
              }
            >
              Get Started
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden text-gray-800 dark:text-white"
          >
            {isMobileMenuOpen ? (
              <X
                className={`h-6 w-6 ${
                  isScrolled ? "text-gray-800" : "text-white"
                }`}
              />
            ) : (
              <Menu
                className={`h-6 w-6 ${
                  isScrolled ? "text-gray-800" : "text-white"
                }`}
              />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="md:hidden bg-white shadow-lg"
        >
          <div className="container mx-auto px-6 py-4">
            <nav className="flex flex-col space-y-3">
              <div className="py-2">
                <button className="flex items-center justify-between w-full text-gray-800 hover:text-blue-700">
                  <span>Solutions</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                <div className="mt-2 pl-4 border-l-2 border-blue-100">
                  <Link
                    href="/solutions/providers"
                    className="block py-2 text-gray-800 hover:text-blue-700"
                  >
                    For Healthcare Providers
                  </Link>
                  <Link
                    href="/solutions/patients"
                    className="block py-2 text-gray-800 hover:text-blue-700"
                  >
                    For Patients
                  </Link>
                  <Link
                    href="/solutions/insurance"
                    className="block py-2 text-gray-800 hover:text-blue-700"
                  >
                    For Insurance Companies
                  </Link>
                </div>
              </div>
              <Link
                href="/features"
                className="py-2 text-gray-800 hover:text-blue-700"
              >
                Features
              </Link>
              <Link
                href="/pricing"
                className="py-2 text-gray-800 hover:text-blue-700"
              >
                Pricing
              </Link>
              <Link
                href="/about"
                className="py-2 text-gray-800 hover:text-blue-700"
              >
                About Us
              </Link>
              <Link
                href="/contact"
                className="py-2 text-gray-800 hover:text-blue-700"
              >
                Contact
              </Link>
              <div className="pt-4 flex flex-col space-y-3">
                <Button className="w-full bg-blue-700 text-white hover:bg-blue-800">
                  Get Started
                </Button>
              </div>
            </nav>
          </div>
        </motion.div>
      )}
    </header>
  );
};

export default Navbar;
