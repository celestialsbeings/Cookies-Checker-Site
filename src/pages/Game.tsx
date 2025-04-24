import React from 'react';
import { Link } from 'react-router-dom';
import CookieCatcher from '../components/CookieCatcher';
import { ArrowLeft } from 'lucide-react';

export const GamePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 text-white">
      <div className="container mx-auto px-2 py-2">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Home</span>
        </Link>

        <div className="w-full mx-auto">
          <div className="text-center mb-2">
            <h1 className="text-xl font-bold mb-1 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
              Cookie Catcher
            </h1>
            <p className="text-gray-300 text-xs">
              Catch good cookies, avoid bad ones!
            </p>
          </div>

          <CookieCatcher />
        </div>
      </div>
    </div>
  );
};