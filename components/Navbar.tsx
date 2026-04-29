'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const isAuthPage = useMemo(() => pathname === '/login' || pathname === '/signup', [pathname]);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (isAuthPage) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass bg-white/70 dark:bg-gray-950/70 border-b border-gray-200/50 dark:border-gray-800/50 animate-fade-in-down">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all duration-300 group-hover:scale-105">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="text-xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Planify
            </span>
          </Link>
          
          {/* Desktop */}
          <div className="hidden sm:flex items-center space-x-3">
            <Link
              href="/login"
              className="px-5 py-2.5 text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white font-semibold transition-all duration-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:-translate-y-0.5"
            >
              Sign Up
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="sm:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg className="w-6 h-6 text-gray-700 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="sm:hidden pb-4 animate-fade-in-down">
            <div className="flex flex-col space-y-2">
              <Link href="/login" className="px-4 py-3 text-gray-700 dark:text-gray-200 font-semibold rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                Login
              </Link>
              <Link href="/signup" className="px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-center">
                Sign Up
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
