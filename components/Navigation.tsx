// components/Navigation.tsx - REDESIGNED for Better UX

import Link from "next/link";
import Image from "next/image";
import React from "react";

interface NavigationProps {
  currentPage?: "home" | "episodes" | "young-artists" | "about" | "advertisers" | "vote" | "track-of-the-week" | "submit-track" | "featured-artist"; 
}

export default function Navigation({ currentPage }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [communityOpen, setCommunityOpen] = React.useState(false);

  const isActive = (page: string) => currentPage === page;
  
  // Check if any "More" menu page is active
  const isCommunityActive = ["episodes", "young-artists", "about", "advertisers"].includes(currentPage || "");

  return (
    <nav className="border-b border-gray-800 bg-black/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition">
            <Image
              src="/images/logo.png"
              alt="יוצאים לטראק"
              width={50}
              height={50}
              className="rounded-lg"
            />
            <span className="text-xl font-semibold hidden sm:block">יוצאים לטראק</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            
            {/* Main Pages */}
            <Link
              href="/"
              className={`text-base font-medium transition ${
                isActive("home") ? "text-white" : "text-gray-300 hover:text-white"
              }`}
            >
              בית
            </Link>

            <Link
              href="/track-of-the-week"
              className={`text-base font-medium transition ${
                isActive("track-of-the-week") ? "text-white" : "text-gray-300 hover:text-white"
              }`}
            >
              הטראק השבועי
            </Link>

            <Link
              href="/featured-artist"
              className={`text-base font-medium transition ${
                isActive("featured-artist") ? "text-white" : "text-gray-300 hover:text-white"
              }`}
            >
              האמן המומלץ
            </Link>

            {/* More Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setCommunityOpen(true)}
              onMouseLeave={() => setCommunityOpen(false)}
            >
              <button
                className={`text-base font-medium transition flex items-center gap-1 ${
                  isCommunityActive ? "text-white" : "text-gray-300 hover:text-white"
                }`}
              >
                עוד
                <svg 
                  className={`w-4 h-4 transition-transform ${communityOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {communityOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl shadow-xl bg-gray-900 border border-gray-800 py-2">
                  <Link
                    href="/episodes"
                    className={`block px-4 py-3 text-sm transition ${
                      isActive("episodes")
                        ? "text-purple-400 bg-gray-800"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    }`}
                  >
                    🎧 פרקים
                  </Link>
                  <Link
                    href="/young-artists"
                    className={`block px-4 py-3 text-sm transition ${
                      isActive("young-artists")
                        ? "text-purple-400 bg-gray-800"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    }`}
                  >
                    🌟 אמנים צעירים
                  </Link>
                  <div className="border-t border-gray-800 my-1"></div>
                  <Link
                    href="/about"
                    className={`block px-4 py-3 text-sm transition ${
                      isActive("about")
                        ? "text-purple-400 bg-gray-800"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    }`}
                  >
                    אודות
                  </Link>
                  <Link
                    href="/advertisers"
                    className={`block px-4 py-3 text-sm transition ${
                      isActive("advertisers")
                        ? "text-purple-400 bg-gray-800"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    }`}
                  >
                    למפרסמים
                  </Link>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <Link
              href="/submit-track"
              className="btn-secondary px-4 py-2 rounded-lg text-sm font-medium"
            >
              הגישו טראק
            </Link>

            <Link
              href="/vote"
              className="btn-primary px-5 py-2 rounded-lg text-sm font-semibold"
            >
              נבחרי השנה 2025
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-300 hover:text-white p-2"
            aria-label="תפריט"
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
            
            {/* Main Pages */}
            <Link
              href="/"
              className={`block px-4 py-3 rounded-lg transition ${
                isActive("home") 
                  ? "text-white bg-gray-800" 
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              בית
            </Link>

            <Link
              href="/track-of-the-week"
              className={`block px-4 py-3 rounded-lg transition ${
                isActive("track-of-the-week") 
                  ? "text-white bg-gray-800" 
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              הטראק השבועי
            </Link>

            <Link
              href="/featured-artist"
              className={`block px-4 py-3 rounded-lg transition ${
                isActive("featured-artist") 
                  ? "text-white bg-gray-800" 
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              ⭐ האמן המומלץ
            </Link>

            {/* More Section */}
            <div className="pt-3 mt-3 border-t border-gray-800">
              <div className="px-4 py-2 text-xs font-semibold text-purple-400 uppercase tracking-wider">
                עוד
              </div>
              
              <Link
                href="/episodes"
                className={`block px-4 py-3 rounded-lg transition ${
                  isActive("episodes") 
                    ? "text-white bg-gray-800" 
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                🎧 פרקים
              </Link>

              <Link
                href="/young-artists"
                className={`block px-4 py-3 rounded-lg transition ${
                  isActive("young-artists") 
                    ? "text-white bg-gray-800" 
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                🌟 אמנים צעירים
              </Link>

              <Link
                href="/about"
                className={`block px-4 py-3 rounded-lg transition ${
                  isActive("about") 
                    ? "text-white bg-gray-800" 
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                אודות
              </Link>

              <Link
                href="/advertisers"
                className={`block px-4 py-3 rounded-lg transition ${
                  isActive("advertisers") 
                    ? "text-white bg-gray-800" 
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                למפרסמים
              </Link>
            </div>

            {/* CTA Buttons */}
            <div className="pt-3 mt-3 border-t border-gray-800 space-y-2">
              <Link
                href="/submit-track"
                className="block btn-secondary px-4 py-3 rounded-lg text-center font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                הגישו טראק
              </Link>

              <Link
                href="/vote"
                className="block btn-primary px-4 py-3 rounded-lg text-center font-semibold"
                onClick={() => setMobileMenuOpen(false)}
              >
                נבחרי השנה 2025
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
