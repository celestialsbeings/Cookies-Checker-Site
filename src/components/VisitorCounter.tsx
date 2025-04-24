import React, { useEffect, useState } from 'react';
import { Users } from 'lucide-react';

export const VisitorCounter: React.FC = () => {
  const [visitorCount, setVisitorCount] = useState(0);
  const [isIncrementing, setIsIncrementing] = useState(false);

  useEffect(() => {
    // Simulate visitor count with local storage
    const lastVisit = localStorage.getItem('lastVisit');
    const today = new Date().toDateString();
    
    if (lastVisit !== today) {
      localStorage.setItem('lastVisit', today);
      // Increment counter in local storage
      const count = parseInt(localStorage.getItem('visitorCount') || '0');
      localStorage.setItem('visitorCount', (count + 1).toString());
    }

    // Animate counter from 0 to current value
    const targetCount = parseInt(localStorage.getItem('visitorCount') || '0');
    let current = 0;
    setIsIncrementing(true);

    const interval = setInterval(() => {
      if (current < targetCount) {
        current += 1;
        setVisitorCount(current);
      } else {
        setIsIncrementing(false);
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-900/95 backdrop-blur-sm p-4 rounded-lg shadow-lg">
      <div className={`flex items-center gap-3 ${isIncrementing ? 'animate-pulse' : ''}`}>
        <Users className="w-5 h-5 text-purple-400" />
        <div>
          <div className="text-sm text-gray-400">Daily Visitors</div>
          <div className="text-xl font-bold text-white">{visitorCount.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
};