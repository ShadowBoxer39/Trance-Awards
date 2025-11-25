// components/Navigation.tsx - REVISED for Improved UX (Grouping)
import Link from "next/link";
import Image from "next/image";
import React from "react";

interface NavigationProps {
  currentPage?: "home" | "episodes" | "young-artists" | "about" | "advertisers" | "vote" | "track-of-the-week" | "submit-track" | "featured-artist"; 
}

// ----------------------------------------------------
// NEW: Community Dropdown Component
// ----------------------------------------------------
const CommunityDropdown = ({ currentPage, isActive }: { currentPage?: NavigationProps['currentPage'], isActive: (page: string) => boolean }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const communityLinks = [
    { href: "/featured-artist", label: "האמן שאתם חייבים להכיר", page: "featured-artist" },
    { href: "/young-artists", label: "אמנים צעירים", page: "young-artists" },
    { href: "/about", label: "אודות", page: "about" },
    { href: "/advertisers", label: "למפרסמים", page: "advertisers" },
  ];
  
  // Determine if the current active page is within this group
  const isCommunityActive = communityLinks.some(link => isActive(link.page));

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        // The "Community" link is active if any of its children are active
        className={`text-base font-medium transition flex items-center gap-1 ${
          isCommunityActive
            ? "text-white hover:text-purple-400"
            : "text-gray-300 hover:text-white"
        }`}
      >
        קהילה
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>

      {isOpen && (
        <div 
          onMouseLeave={() => setIsOpen(false)}
          className="absolute right-0 mt-3 w-56 rounded-md shadow-lg bg-gray-900 ring-1 ring-black ring-opacity-5 z-50 origin-top-right"
        >
          <div className="py-1">
            {communityLinks.map((link) => (
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

          {/* Desktop Menu - SIMPLIFIED */}
          <div className="hidden md:flex items-center gap-8">
            
            {/* Core Link 1: Home */}
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
            
            {/* Core Link 2: Track of the Week */}
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

            {/* Core Link 3: Episodes */}
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
            
            {/* NEW Core Link 4: Community Dropdown */}
            <CommunityDropdown currentPage={currentPage} isActive={isActive} />

            {/* Action Button 1 (Secondary): Submit Track */}
            <Link
              href="/submit-track"
              className="btn-secondary px-4 py-2 rounded-lg text-sm font-medium"
            >
              הגישו טראק
            </Link>

            {/* Action Button 2 (Primary): Vote */}
            <Link
              href="/vote"
              className="btn-primary px-6 py-3 rounded-lg text-base font-medium"
            >
              נבחרי השנה 2025
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

        {/* Mobile Menu - LISTING ALL PAGES LOGICALLY */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-1">
            {/* Core Pages */}
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
              href="/episodes"
              className={`block text-base font-medium py-3 px-4 rounded-lg hover:bg-gray-800 transition ${
                isActive("episodes") ? "text-white" : "text-gray-300 hover:text-white"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              פרקים
            </Link>
            
            {/* Community Links (nested for mobile clarity) */}
            <div className="pt-2 border-t border-gray-700/50 mt-2">
              <p className="text-sm font-semibold px-4 pt-2 text-purple-400">קהילה</p>
              {communityLinks.map((link) => (
                <Link
                  key={link.page}
                  href={link.href}
                  className={`block text-base font-medium py-2 px-6 rounded-lg hover:bg-gray-800 transition ${
                    isActive(link.page) ? "text-white" : "text-gray-300 hover:text-white"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* CTA Buttons */}
            <Link
              href="/submit-track"
              className="block btn-secondary px-4 py-3 rounded-lg text-base font-medium text-center mt-4"
              onClick={() => setMobileMenuOpen(false)}
            >
              הגישו טראק
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
