// components/Navigation.tsx - Updated with better spread and featured-artists

import Link from "next/link";
import Image from "next/image";
import React from "react";

interface NavigationProps {
  currentPage?: "home" | "episodes" | "young-artists" | "about" | "advertisers" | "vote" | "track-of-the-week" | "submit-track" | "featured-artist" | "featured-artists" | "artists" | "legends" | "accessibility" | "radio" | "merch";}

export default function Navigation({ currentPage }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [moreOpen, setMoreOpen] = React.useState(false);

  const isActive = (page: string) => currentPage === page;
  
  // Featured artists pages (both singular and plural should highlight the same nav item)
  const isFeaturedActive = currentPage === "featured-artist" || currentPage === "featured-artists";
  
  // Check if any "More" menu page is active
  const isMoreActive = ["episodes", "young-artists", "track-of-the-week", "submit-track", "about", "advertisers", "legends", "merch"].includes(currentPage || "");

  return (
    <nav className="border-b border-gray-800 bg-black/50 backdrop-blur-md sticky top-0 z-50">
      <div className="w-full px-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between h-20 max-w-[1800px] mx-auto">
          
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition flex-shrink-0">
            <Image
              src="/images/logo.png"
              alt="יוצאים לטראק"
              width={50}
              height={50}
              className="rounded-lg"
            />
            <span className="text-xl font-semibold hidden sm:block">יוצאים לטראק</span>
          </Link>

          {/* Desktop Menu - Centered with good spacing */}
          <div className="hidden md:flex items-center justify-center flex-1 px-8">
            <div className="flex items-center gap-8 lg:gap-12">
              
              <Link
                href="/"
                className={`text-base font-medium transition whitespace-nowrap ${
                  isActive("home") ? "text-white" : "text-gray-300 hover:text-white"
                }`}
              >
                בית
              </Link>

              <Link
                href="/artists"
                className={`text-base font-medium transition whitespace-nowrap ${
                  isActive("artists") ? "text-white" : "text-gray-300 hover:text-white"
                }`}
              >
                האמנים
              </Link>

             <Link
                href="/radio"
                className={`text-base font-medium transition whitespace-nowrap ${
                  isActive("radio") ? "text-white" : "text-gray-300 hover:text-white"
                }`}
              >
                רדיו
              </Link>

             <Link
                href="/featured-artists"
                className={`text-base font-medium transition whitespace-nowrap ${
                  isFeaturedActive ? "text-white" : "text-gray-300 hover:text-white"
                }`}
              >
                האמנים המומלצים שלנו
              </Link>

              {/* More Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setMoreOpen(true)}
                onMouseLeave={() => setMoreOpen(false)}
              >
                <button
                  className={`text-base font-medium transition flex items-center gap-1 whitespace-nowrap ${
                    isMoreActive ? "text-white" : "text-gray-300 hover:text-white"
                  }`}
                >
                  עוד
                  <svg 
                    className={`w-4 h-4 transition-transform ${moreOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {moreOpen && (
                  <div className="absolute right-0 top-full pt-1 w-64 z-50">
                    <div className="rounded-xl shadow-xl bg-gray-900 border border-gray-800 py-2">
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
  href="/merch"
  className={`block px-4 py-3 text-sm transition ${
    isActive("merch")
      ? "text-purple-400 bg-gray-800"
      : "text-gray-300 hover:bg-gray-800 hover:text-white"
  }`}
>
  🛍️ מרצ׳
</Link>

                      <Link
                        href="/young-artists"
                        className={`block px-4 py-3 text-sm transition ${
                          isActive("young-artists")
                            ? "text-purple-400 bg-gray-800"
                            : "text-gray-300 hover:bg-gray-800 hover:text-white"
                        }`}
                      >
                        🌟 הרשמה לאמנים צעירים
                      </Link>
                     

                                        <Link
  href="/legends"
  className={`block px-4 py-3 text-sm transition ${
    isActive("legends")
      ? "text-purple-400 bg-gray-800"
      : "text-gray-300 hover:bg-gray-800 hover:text-white"
  }`}
>
  👑 אגדות
</Link>
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
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CTA Button - Right side */}
          <div className="hidden md:block flex-shrink-0">
            <Link
              href="/vote"
              className="btn-primary px-5 py-2 rounded-lg text-sm font-semibold whitespace-nowrap"
            >
              תוצאות נבחרי השנה
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
              href="/artists"
              className={`block px-4 py-3 rounded-lg transition ${
                isActive("artists") 
                  ? "text-white bg-gray-800" 
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              🎤 האמנים
            </Link>

           <Link
              href="/radio"
              className={`block px-4 py-3 rounded-lg transition ${
                isActive("radio") 
                  ? "text-white bg-gray-800" 
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              📻 רדיו
            </Link>

            <Link
              href="/featured-artists"
              className={`block px-4 py-3 rounded-lg transition ${
                isFeaturedActive 
                  ? "text-white bg-gray-800" 
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              ⭐האמנים המומלצים שלנו
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
  href="/merch"
  className={`block px-4 py-3 rounded-lg transition ${
    isActive("merch") 
      ? "text-white bg-gray-800" 
      : "text-gray-300 hover:bg-gray-800 hover:text-white"
  }`}
  onClick={() => setMobileMenuOpen(false)}
>
  🛍️ מרצ׳
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
                🌟 הרשמה לאמנים צעירים
              </Link>

             

              <Link
                href="/submit-track"
                className={`block px-4 py-3 rounded-lg transition ${
                  isActive("submit-track") 
                    ? "text-white bg-gray-800" 
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                הגישו טראק
              </Link>

<Link
  href="/legends"
  className={`block px-4 py-3 rounded-lg transition ${
    isActive("legends") 
      ? "text-white bg-gray-800" 
      : "text-gray-300 hover:bg-gray-800 hover:text-white"
  }`}
  onClick={() => setMobileMenuOpen(false)}
>
  👑 אגדות
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

            {/* CTA Button */}
            <div className="pt-3 mt-3 border-t border-gray-800">
              <Link
                href="/vote"
                className="block btn-primary px-4 py-3 rounded-lg text-center font-semibold"
                onClick={() => setMobileMenuOpen(false)}
              >
                תוצאות נבחרי השנה
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
