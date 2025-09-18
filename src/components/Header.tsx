'use client';

import Link from 'next/link';
import { useState } from 'react';
import LSGIcon from './LSGIcon';

interface HeaderProps {
  className?: string;
}

export default function Header({ className = '' }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className={`bg-white border-b border-neutral-200/50 sticky top-0 z-50 backdrop-blur-sm ${className}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <img 
                src="/LSG_Logo_Horizontal_RGB_Lean Blue.png" 
                alt="LSG Logo" 
                className="h-[2.6rem] sm:h-[3.25rem] w-auto"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className="text-trust-navy hover:text-lean-blue transition-colors duration-200 font-medium"
            >
              AI Readiness Quick Check
            </Link>
            <Link 
              href="/privacy-policy" 
              className="text-trust-navy hover:text-lean-blue transition-colors duration-200 font-medium"
            >
              Privacy Policy
            </Link>
            <Link 
              href="/terms-of-service" 
              className="text-trust-navy hover:text-lean-blue transition-colors duration-200 font-medium"
            >
              Terms of Service
            </Link>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-trust-navy hover:text-lean-blue hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-lean-blue transition-colors duration-200"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <LSGIcon 
                name={isMenuOpen ? "close" : "menu"} 
                size="md" 
                className="h-6 w-6"
              />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-neutral-200/50">
              <Link
                href="/"
                className="text-trust-navy hover:text-lean-blue block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                AI Readiness Quick Check
              </Link>
              <Link
                href="/privacy-policy"
                className="text-trust-navy hover:text-lean-blue block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms-of-service"
                className="text-trust-navy hover:text-lean-blue block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Terms of Service
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
