// components/Navigation.tsx - REUSABLE NAVIGATION COMPONENT
import Link from "next/link";
import Image from "next/image";
import React from "react";

// *** MODIFICATION 1: Add new page keys ***
interface NavigationProps {
  currentPage?: "home" | "episodes" | "young-artists" | "about" | "advertisers" | "vote" | "track-of-the-week" | "submit-track"; 
}

export default function Navigation({ currentPage }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const isActive = (page: string) => currentPage === page;

  return (
    <nav className="border-b border-gray-800 bg-black/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <Link
            href="/"
            className="flex items-center gap-3 hover:opacity-90 transition"
          >
            <Image
              src="/images/logo.png"
              alt="Logo"
              width={50}
              height={50}
              className="rounded-lg"
            />
            <span className="text-xl font-semibold hidden sm:block">יוצאים לטראק</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className={`text-base font-medium transition ${
                isActive("home")
                  ? "text-white hover:text-purple-400"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              בית
            </Link>
            {/* *** MODIFICATION 2: Add Track of the Week Link *** */}
            <Link
              href="/track-of-the-week"
              className={`text-base font-medium transition ${
                isActive("track-of-the-week")
                  ? "text-white hover:text-purple-400"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              הטראק השבועי
            </Link>
            <Link
              href="/episodes"
              className={`text-base font-medium transition ${
                isActive("episodes")
                  ? "text-white hover:text-purple-400"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              פרקים
            </Link>
            <Link
              href="/young-artists"
              className={`text-base font-medium transition ${
                isActive("young-artists")
                  ? "text-white hover:text-purple-400"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              אמנים צעירים
            </Link>
            <Link
              href="/about"
              className={`text-base font-medium transition ${
                isActive("about")
                  ? "text-white hover:text-purple-400"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              אודות
            </Link>
            <Link
              href="/advertisers"
              className={`text-base font-medium transition ${
                isActive("advertisers")
                  ? "text-white hover:text-purple-400"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              למפרסמים
            </Link>
            {/* *** MODIFICATION 3: Add Submit Track Link (optional, can be a button) *** */}
             <Link
              href="/submit-track"
              className="btn-secondary px-4 py-2 rounded-lg text-sm font-medium"
            >
              הגישו טראק
            </Link>
            <Link
              href="/vote"
              className="btn-primary px-6 py-3 rounded-lg text-base font-medium"
            >
              הצבעה
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-300 hover:text-white p-2"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-1">
            <Link
              href="/"
              className={`block text-base font-medium py-3 px-4 rounded-lg hover:bg-gray-800 transition ${
                isActive("home") ? "text-white" : "text-gray-300 hover:text-white"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              בית
            </Link>
            {/* *** MODIFICATION 4: Add Mobile Track of the Week Link *** */}
            <Link
              href="/track-of-the-week"
              className={`block text-base font-medium py-3 px-4 rounded-lg hover:bg-gray-800 transition ${
                isActive("track-of-the-week") ? "text-white" : "text-gray-300 hover:text-white"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              הטראק השבועי
            </Link>
            <Link
              href="/episodes"
              className={`block text-base font-medium py-3 px-4 rounded-lg hover:bg-gray-800 transition ${
                isActive("episodes") ? "text-white" : "text-gray-300 hover:text-white"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              פרקים
            </Link>
            <Link
              href="/young-artists"
              className={`block text-base font-medium py-3 px-4 rounded-lg hover:bg-gray-800 transition ${
                isActive("young-artists") ? "text-white" : "text-gray-300 hover:text-white"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              אמנים צעירים
            </Link>
            <Link
              href="/about"
              className={`block text-base font-medium py-3 px-4 rounded-lg hover:bg-gray-800 transition ${
                isActive("about") ? "text-white" : "text-gray-300 hover:text-white"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              אודות
            </Link>
            <Link
              href="/advertisers"
              className={`block text-base font-medium py-3 px-4 rounded-lg hover:bg-gray-800 transition ${
                isActive("advertisers") ? "text-white" : "text-gray-300 hover:text-white"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              למפרסמים
            </Link>
            {/* *** MODIFICATION 5: Add Mobile Submit Track Link *** */}
            <Link
              href="/submit-track"
              className="block btn-secondary px-4 py-3 rounded-lg text-base font-medium text-center mt-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              הגישו טראק
            </Link>
            <Link
              href="/vote"
              className="block btn-primary px-4 py-3 rounded-lg text-base font-medium text-center mt-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              הצבעה
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
