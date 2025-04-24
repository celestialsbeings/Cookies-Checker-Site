import React, { useEffect, useState } from 'react';

interface AdBlockDetectorProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const AdBlockDetector: React.FC<AdBlockDetectorProps> = ({ 
  children, 
  fallback = (
    <div className="p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
      <p className="font-bold">Ad Blocker Detected</p>
      <p>You're using an ad blocker. Please consider disabling it to support us.</p>
    </div>
  ) 
}) => {
  const [adBlockDetected, setAdBlockDetected] = useState<boolean | null>(null);

  useEffect(() => {
    const detectAdBlock = async () => {
      try {
        // Method 1: Try to load a fake ad script
        const testAd = document.createElement('div');
        testAd.innerHTML = '&nbsp;';
        testAd.className = 'adsbox';
        document.body.appendChild(testAd);
        
        // Wait a bit for ad blockers to hide the element
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Check if the ad element was hidden by an ad blocker
        const isBlocked = testAd.offsetHeight === 0;
        document.body.removeChild(testAd);
        
        // Method 2: Try to fetch a known ad domain
        try {
          const fetchTest = await fetch('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js', {
            method: 'HEAD',
            mode: 'no-cors',
            cache: 'no-cache',
          });
          // If we get here, the request wasn't blocked
          setAdBlockDetected(isBlocked);
        } catch (error) {
          // If fetch fails, it's likely due to an ad blocker
          setAdBlockDetected(true);
        }
      } catch (error) {
        console.error('Error detecting ad blocker:', error);
        setAdBlockDetected(false); // Assume no ad blocker on error
      }
    };

    detectAdBlock();

    return () => {
      // Cleanup if needed
    };
  }, []);

  // Show nothing until detection is complete
  if (adBlockDetected === null) {
    return null;
  }

  return (
    <>
      {adBlockDetected ? fallback : children}
    </>
  );
};

export default AdBlockDetector;
