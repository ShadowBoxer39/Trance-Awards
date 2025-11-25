// components/Navigation.tsx - REVISED with "More" Dropdown
import Link from "next/link";
import Image from "next/image";
import React from "react";

interface NavigationProps {
  currentPage?: "home" | "episodes" | "young-artists" | "about" | "advertisers" | "vote" | "track-of-the-week" | "submit-track" | "featured-artist"; 
}

// ----------------------------------------------------
// NEW: More Dropdown Component
// ----------------------------------------------------
const MoreDropdown = ({ currentPage, isActive }: { currentPage?: NavigationProps['currentPage'], isActive: (page: string) => boolean }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const secondaryLinks = [
    { href: "/featured-artist", label: "האמן שאתם חייבים להכיר", page: "featured-artist" },
    { href: "/young-artists", label: "אמנים צעירים", page: "young-artists" },
    { href: "/about", label: "אודות", page: "about" },
    { href: "/advertisers", label: "למפרסמים", page: "advertisers" },
  ];
  
  // Determine if the current active page is within the secondary links
  const isSecondaryActive = secondaryLinks.some(link => isActive(link.page));

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        // The "More" link is active if any of the secondary links are the current page
        className={`text-base font-medium transition flex items-center gap-1 ${
          isSecondaryActive
            ? "text-white hover:text-purple-400"
            : "text-gray-300 hover:text-white"
        }`}
      >
        עוד
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-56 rounded-md shadow-lg bg-gray-900 ring-1 ring-black ring-opacity-5 z-50 origin-top-right">
          <div className="py-1">
            {secondaryLinks.map((link) => (
              <Link
                key={link.page}
                href={link.href}
                className={`block px-4 py-2 text-sm transition ${
                  isActive(link.page)
                    ? "text-purple-400 bg-gray-800"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
// ----------------------------------------------------

export default function Navigation({ currentPage }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const isActive = (page: string) => currentPage === page;

  return (
    <nav className="border-b border-gray-800 bg-black/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand (RTL Start) */}
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

          {/* Desktop Menu - SIMPLIFIED WITH DROPDOWN */}
          <div className="hidden md:flex items-center gap-8">
            {/* Primary Links */}
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
            
            {/* Dropdown for Secondary Links */}
            <MoreDropdown currentPage={currentPage} isActive={isActive} />

            {/* Action Buttons (RTL End) */}
            <Link
              href="/submit-track"
              className="btn-secondary px-4 py-2 rounded-lg text-sm font-medium"
            >
              בחירת טראק השבוע
            </Link>
            <Link
              href="/vote"
              className="btn-primary px-6 py-3 rounded-lg text-base font-medium"
            >
              נבחרי השנה 2025
            </Link>
          </div>

          {/* Mobile Menu Button (RTL End) */}
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

        {/* Mobile Menu (All links are listed here, in logical reading order) */}
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
              href="/featured-artist"
              className={`block text-base font-medium py-3 px-4 rounded-lg hover:bg-gray-800 transition ${
                isActive("featured-artist") ? "text-white" : "text-gray-300 hover:text-white"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              האמן שאתם חייבים להכיר
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
            <Link
              href="/submit-track"
              className="block btn-secondary px-4 py-3 rounded-lg text-base font-medium text-center mt-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              בחירת טראק השבוע
            </Link>
            <Link
              href="/vote"
              className="block btn-primary px-4 py-3 rounded-lg text-base font-medium text-center mt-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              נבחרי השנה 2025
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
