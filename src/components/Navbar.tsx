import React, { useState, useEffect } from 'react';
import { Menu, X, Gamepad, ChevronRight, ExternalLink } from 'lucide-react';
import { CookieLogo } from './CookieLogo';
import { useSound } from '../hooks/useSound';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const { playClickSound } = useSound();

  // Handle scroll events and active section detection
  useEffect(() => {
    const handleScroll = () => {
      // Update navbar background
      setIsScrolled(window.scrollY > 20);

      // Detect active section
      const sections = ['features', 'pricing', 'how-to-purchase', 'faq', 'contact'];
      const currentSection = sections.find(section => {
        const element = document.getElementById(section);
        if (!element) return false;

        const rect = element.getBoundingClientRect();
        return rect.top <= 150 && rect.bottom >= 150;
      });

      if (currentSection) {
        setActiveSection(currentSection);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const scrollToSection = (id: string) => {
    playClickSound();
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <nav className={`fixed w-full z-40 transition-all duration-500 ${
      isScrolled ? 'bg-[#0A0A0A]/90 backdrop-blur-md shadow-lg border-b border-[#7B4ED8]/20 py-2' : 'py-4 bg-transparent'
    }`}>
      <div className="container mx-auto px-4">
        {/* Top bar with logo and menu button */}
        <div className="flex items-center justify-between">
          {/* Logo with animation */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative overflow-hidden rounded-full p-1 transition-all duration-300 group-hover:bg-[#7B4ED8]/10">
              <CookieLogo className="w-7 h-7 sm:w-8 sm:h-8 text-[#9C5FE9] transition-transform duration-500 group-hover:rotate-12" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#7B4ED8]/0 via-[#7B4ED8]/30 to-[#7B4ED8]/0 opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-500"></div>
            </div>
            <span className="font-bold text-white text-base sm:text-lg tracking-wide transition-all duration-300 group-hover:text-[#9C5FE9]">Celestial Bot</span>
          </Link>

          {/* Desktop Navigation - Enhanced */}
          <div className="hidden md:flex items-center gap-5 lg:gap-7">
            {['features', 'pricing', 'how-to-purchase', 'faq', 'contact'].map((section, index) => (
              <button
                key={section}
                onClick={() => scrollToSection(section)}
                className={`relative px-3 py-2 text-sm font-medium transition-all duration-300 ${activeSection === section ? 'text-[#3DEFE9]' : 'text-gray-300 hover:text-white'}`}
              >
                {section === 'how-to-purchase' ? 'How to Buy' : section.charAt(0).toUpperCase() + section.slice(1)}
                <span
                  className={`absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#7B4ED8] to-[#3DEFE9] transform origin-left transition-transform duration-300 ${activeSection === section ? 'scale-x-100' : 'scale-x-0'}`}
                ></span>
              </button>
            ))}

            <div className="h-6 w-px bg-gradient-to-b from-transparent via-[#7B4ED8]/30 to-transparent mx-1"></div>

            <Link
              to="/game"
              className="relative overflow-hidden group px-4 py-2 rounded-md bg-[#3DEFE9]/10 border border-[#3DEFE9]/30 text-[#3DEFE9] transition-all duration-300 hover:bg-[#3DEFE9]/20 hover:border-[#3DEFE9]/50"
              onClick={playClickSound}
            >
              <span className="flex items-center gap-2">
                <Gamepad className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12" />
                <span>Play Game</span>
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-[#3DEFE9]/0 via-[#3DEFE9]/10 to-[#3DEFE9]/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></span>
            </Link>

            <Link
              to="/admin/"
              className="relative px-3 py-2 text-sm font-medium text-gray-300 hover:text-[#3DEFE9] transition-all duration-300"
              onClick={playClickSound}
            >
              Admin
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#3DEFE9] transform origin-left transition-transform duration-300 scale-x-0 group-hover:scale-x-100"></span>
            </Link>

            <a
              href="https://t.me/cookies_checkerbot"
              target="_blank"
              rel="noopener noreferrer"
              className="relative overflow-hidden group px-5 py-2 rounded-md bg-gradient-to-r from-[#7B4ED8] to-[#9C5FE9] text-white transition-all duration-300 hover:shadow-lg hover:shadow-[#7B4ED8]/20 hover:translate-y-[-1px]"
              onClick={playClickSound}
            >
              <span className="flex items-center gap-2">
                <span>Get Started</span>
                <ExternalLink className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-[#7B4ED8]/0 via-white/10 to-[#7B4ED8]/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></span>
            </a>
          </div>

          {/* Mobile Menu Button - Ultra Modern */}
          <button
            className="md:hidden relative overflow-hidden flex items-center justify-center w-11 h-11 rounded-md transition-all duration-300"
            onClick={() => {
              playClickSound();
              setIsMenuOpen(!isMenuOpen);
            }}
            aria-label="Toggle menu"
          >
            <div className={`absolute inset-0 bg-gradient-to-r from-[#7B4ED8] to-[#9C5FE9] transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-80'}`}></div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#7B4ED8]/0 via-white/20 to-[#7B4ED8]/0 -translate-x-full hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
            <div className="relative z-10 transition-transform duration-300" style={{ transform: isMenuOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>
              {isMenuOpen ? <X size={22} className="text-white" /> : <Menu size={22} className="text-white" />}
            </div>
          </button>
        </div>

        {/* Mobile Menu - Ultra Modern with Smooth Animations */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${isMenuOpen ? 'max-h-[600px] opacity-100 mt-4 mb-4' : 'max-h-0 opacity-0'}`}
        >
          <div className="relative overflow-hidden rounded-xl bg-[#0A0A0A] border border-[#7B4ED8]/30 shadow-lg">
            {/* Animated background effect */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
              <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#7B4ED8]/20 rounded-full filter blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#3DEFE9]/20 rounded-full filter blur-3xl"></div>
            </div>

            <div className="relative z-10 p-4">
              <div className="grid gap-3">
                {/* Navigation Links with Enhanced Hover Effects */}
                {['features', 'pricing', 'how-to-purchase', 'faq', 'contact'].map((section, index) => (
                  <button
                    key={section}
                    onClick={() => scrollToSection(section)}
                    className="flex justify-between items-center text-white p-3 rounded-lg bg-[#0A0A0A] border border-[#7B4ED8]/30 hover:bg-[#7B4ED8]/10 hover:border-[#7B4ED8]/50 transition-all duration-300 hover:pl-5"
                    style={{ transitionDelay: `${index * 50}ms` }}
                  >
                    <span className="font-medium">
                      {section === 'how-to-purchase' ? 'How to Buy' : section.charAt(0).toUpperCase() + section.slice(1)}
                    </span>
                    <ChevronRight size={18} className="text-[#7B4ED8] transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                ))}

                {/* Gradient Divider with Animation */}
                <div className="h-px bg-gradient-to-r from-transparent via-[#7B4ED8]/50 to-transparent my-3"></div>

                {/* Action Buttons with Enhanced Hover Effects */}
                <Link
                  to="/game"
                  className="group flex items-center justify-between p-3 rounded-lg bg-[#3DEFE9]/10 border border-[#3DEFE9]/30 text-[#3DEFE9] hover:bg-[#3DEFE9]/15 hover:border-[#3DEFE9]/50 transition-all duration-300"
                  onClick={() => {
                    playClickSound();
                    setIsMenuOpen(false);
                  }}
                >
                  <div className="flex items-center">
                    <Gamepad className="w-5 h-5 mr-3 transition-transform duration-300 group-hover:rotate-12" />
                    <span className="font-medium">Play Game</span>
                  </div>
                  <ChevronRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>

                <Link
                  to="/admin/"
                  className="group flex items-center justify-between p-3 rounded-lg bg-[#0A0A0A] border border-[#3DEFE9]/20 text-white hover:text-[#3DEFE9] hover:bg-[#3DEFE9]/5 hover:border-[#3DEFE9]/40 transition-all duration-300"
                  onClick={() => {
                    playClickSound();
                    setIsMenuOpen(false);
                  }}
                >
                  <span className="font-medium">Admin Panel</span>
                  <ChevronRight size={18} className="text-[#3DEFE9] transition-transform duration-300 group-hover:translate-x-1" />
                </Link>

                <a
                  href="https://t.me/cookies_checkerbot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative overflow-hidden flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-[#7B4ED8] to-[#9C5FE9] text-white hover:shadow-lg hover:shadow-[#7B4ED8]/20 transition-all duration-300 hover:translate-y-[-2px]"
                  onClick={() => {
                    playClickSound();
                    setIsMenuOpen(false);
                  }}
                >
                  <span className="font-medium">Get Started</span>
                  <ExternalLink size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;