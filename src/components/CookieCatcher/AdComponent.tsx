import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CookieService } from '../../services/cookieService';

interface AdComponentProps {
  onAdComplete: () => void;
  onAdError: (error: string) => void;
}

// Declare global AdSense type and custom properties
declare global {
  interface Window {
    adsbygoogle: any[];
    adLoadedSuccessfully?: boolean;
  }
}

export const AdComponent: React.FC<AdComponentProps> = ({ onAdComplete, onAdError }) => {
  const [adStatus, setAdStatus] = useState<'loading' | 'watching' | 'completed' | 'error'>('loading');
  const [timeLeft, setTimeLeft] = useState(10); // 10 seconds to watch the ad
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const adContainerRef = useRef<HTMLDivElement>(null);
  const hasClaimedRef = useRef(false);
  const isClaimingRef = useRef(false); // Mutex lock to prevent multiple simultaneous API calls

  // State to track window size
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  // Effect to handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    let adCheckTimer: NodeJS.Timeout;

    // Function to start the countdown timer
    const startCountdownTimer = () => {
      // Clear any existing timer first to prevent duplicates
      if (timer) {
        clearInterval(timer);
      }

      // Set a new timer
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            if (timer) clearInterval(timer);
            timer = null;
            if (!hasClaimedRef.current) {
              claimPrize();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    };

    // Function to detect if an ad blocker is active
    const detectAdBlocker = async (): Promise<boolean> => {
      try {
        // Method 1: Try to load a fake ad script
        const testAd = document.createElement('div');
        testAd.innerHTML = '&nbsp;';
        testAd.className = 'adsbox adsbygoogle';
        document.body.appendChild(testAd);

        // Wait a bit for ad blockers to hide the element
        await new Promise(resolve => setTimeout(resolve, 100));

        // Check if the ad element was hidden by an ad blocker
        const isBlocked = testAd.offsetHeight === 0;
        document.body.removeChild(testAd);

        // Method 2: Try to fetch a known ad domain
        try {
          await fetch('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js', {
            method: 'HEAD',
            mode: 'no-cors',
            cache: 'no-cache',
          });
          // If we get here, the request wasn't blocked
          return isBlocked;
        } catch (error) {
          // If fetch fails, it's likely due to an ad blocker
          return true;
        }
      } catch (error) {
        console.error('Error detecting ad blocker:', error);
        return false; // Assume no ad blocker on error
      }
    };

    // Function to show a fallback ad when Google Ads fail to load
    const showFallbackAd = async () => {
      if (adContainerRef.current) {
        console.log('Showing fallback ad...');
        adContainerRef.current.innerHTML = '';

        // Check if ad blocker is active
        const isAdBlockerActive = await detectAdBlocker();

        const fallbackAd = document.createElement('div');
        fallbackAd.className = 'flex flex-col items-center justify-center p-4 bg-gray-800/50 rounded-xl border border-gray-700/30';
        fallbackAd.style.width = '100%';

        // Set height based on screen width for responsive design
        const screenWidth = window.innerWidth;
        if (screenWidth < 768) {
          // Mobile
          fallbackAd.style.height = '100px';
          fallbackAd.className += ' text-sm';
        } else if (screenWidth < 1024) {
          // Tablet
          fallbackAd.style.height = '200px';
        } else {
          // Desktop
          fallbackAd.style.height = '250px';
        }

        const adTitle = document.createElement('h3');
        adTitle.className = 'text-xl font-bold text-gray-100 mb-3';

        const adText = document.createElement('p');
        adText.className = 'text-gray-400 text-center mb-4';

        const adButton = document.createElement('button');
        adButton.className = 'px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-xl font-medium shadow-lg shadow-gray-900/50 hover:shadow-gray-900/70 transition-all border border-gray-600';

        if (isAdBlockerActive) {
          // Show ad blocker message
          adTitle.textContent = 'Ad Blocker Detected';
          adText.textContent = 'Please consider disabling your ad blocker to support Cookie Catcher.';
          adButton.textContent = 'Learn Why';
          adButton.onclick = () => {
            window.open('https://example.com/why-disable-adblock', '_blank');
          };
        } else {
          // Show regular support message
          adTitle.textContent = 'Support Cookie Catcher';
          adText.textContent = 'Your support helps us continue providing delicious cookies to users worldwide.';
          adButton.textContent = 'Learn More';
          adButton.onclick = () => {
            window.open('https://example.com/support', '_blank');
          };
        }

        fallbackAd.appendChild(adTitle);
        fallbackAd.appendChild(adText);
        fallbackAd.appendChild(adButton);

        adContainerRef.current.appendChild(fallbackAd);
      }
    };

    const loadAd = async () => {
      try {
        // Initialize adsbygoogle if not already initialized
        if (!window.adsbygoogle) {
          window.adsbygoogle = [];
        }

        // Check if Google AdSense script is already loaded
        const isAdSenseLoaded = Array.from(document.getElementsByTagName('script'))
          .some(script => script.src.includes('adsbygoogle'));

        // Load the AdSense script with a timeout if not already loaded
        const adLoadPromise = new Promise((resolve, reject) => {
          if (isAdSenseLoaded) {
            console.log('AdSense script already loaded');
            resolve(true);
            return;
          }

          console.log('Loading AdSense script...');
          const script = document.createElement('script');
          script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${import.meta.env.VITE_GOOGLE_AD_CLIENT}`;
          script.async = true;
          script.crossOrigin = 'anonymous';

          script.onload = () => {
            console.log('AdSense script loaded successfully');
            resolve(true);
          };
          script.onerror = () => {
            console.error('AdSense script failed to load');
            reject(new Error('Ad script failed to load'));
          };
          document.head.appendChild(script);
        });

        // Set a 5-second timeout for ad loading
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => {
            console.warn('Ad loading timed out after 5 seconds');
            reject(new Error('Ad loading timed out'));
          }, 5000);
        });

        // Try to load the ad with timeout
        try {
          await Promise.race([adLoadPromise, timeoutPromise]);

          // Create the ad container
          if (adContainerRef.current) {
            console.log('Creating ad container...');
            // Create a responsive ad unit based on screen size
            const adElement = document.createElement('ins');
            adElement.className = 'adsbygoogle';
            adElement.style.display = 'block';
            adElement.style.width = '100%';

            // Set height based on screen width for responsive design
            const screenWidth = window.innerWidth;
            if (screenWidth < 768) {
              // Mobile
              adElement.style.height = '100px';
              adElement.setAttribute('data-ad-format', 'fluid');
            } else if (screenWidth < 1024) {
              // Tablet
              adElement.style.height = '200px';
              adElement.setAttribute('data-ad-format', 'auto');
            } else {
              // Desktop
              adElement.style.height = '250px';
              adElement.setAttribute('data-ad-format', 'auto');
            }

            adElement.setAttribute('data-ad-client', import.meta.env.VITE_GOOGLE_AD_CLIENT);
            adElement.setAttribute('data-ad-slot', import.meta.env.VITE_GOOGLE_AD_SLOT);
            adElement.setAttribute('data-full-width-responsive', 'true');

            // Add loading attribute for better performance
            adElement.setAttribute('loading', 'lazy');

            adContainerRef.current.innerHTML = '';
            adContainerRef.current.appendChild(adElement);

            // Try to push the ad
            try {
              console.log('Pushing ad to adsbygoogle...');
              (window.adsbygoogle = window.adsbygoogle || []).push({});

              // Set a timeout to check if the ad was loaded
              adCheckTimer = setTimeout(async () => {
                // Check if ad blocker is active
                const isAdBlockerActive = await detectAdBlocker();

                if (isAdBlockerActive) {
                  console.warn('Ad blocker detected, showing fallback ad');
                  showFallbackAd();
                  setAdStatus('watching');
                  return;
                }

                // Check if the ad container has content
                const adHeight = adElement.clientHeight;
                console.log('Ad height after loading:', adHeight);

                // Check if the ad has been filled with content
                const adComputedStyle = window.getComputedStyle(adElement);
                const adVisibility = adComputedStyle.visibility;
                const adDisplay = adComputedStyle.display;

                console.log('Ad visibility:', adVisibility, 'display:', adDisplay);

                // If the ad is loaded properly, it should have a height > 0 and be visible
                if (adHeight > 0 && adVisibility !== 'hidden' && adDisplay !== 'none') {
                  console.log('Ad loaded successfully');
                  // Track that the ad was loaded successfully
                  window.adLoadedSuccessfully = true;
                } else {
                  console.warn('Ad may not have loaded properly');
                  // Show a fallback ad or message
                  showFallbackAd();
                  // Still allow the user to get a cookie even if ad didn't load
                  window.adLoadedSuccessfully = true;
                }

                // Only set status to watching if it's not already set
                // This prevents duplicate state updates
                if (adStatus !== 'watching') {
                  setAdStatus('watching');
                }
              }, 2000);
            } catch (adPushError) {
              console.error('Error pushing ad:', adPushError);
              // Show a fallback ad or message
              showFallbackAd();
              // Only set status to watching if it's not already set
              if (adStatus !== 'watching') {
                setAdStatus('watching');
              }
            }
          }
        } catch (error) {
          console.warn('Ad not available:', error);
          // If ad fails to load, show fallback ad and continue
          if (adContainerRef.current) {
            showFallbackAd();
          }
          // Only set status to watching if it's not already set
          if (adStatus !== 'watching') {
            setAdStatus('watching');
          }
        }

        // Start countdown timer regardless of ad status
        startCountdownTimer();

      } catch (error) {
        console.warn('Ad system not ready:', error);
        // Show fallback ad and continue with countdown even if ad system fails
        if (adContainerRef.current) {
          showFallbackAd();
        }
        // Only set status to watching if it's not already set
        if (adStatus !== 'watching') {
          setAdStatus('watching');
        }
        // Use the same timer function to avoid duplicates
        startCountdownTimer();
      }
    };

    // Create a claim prize function with mutex lock
    const claimPrize = async () => {
      console.log('Claiming prize...');

      // Check if already claimed or currently claiming
      if (hasClaimedRef.current) {
        console.log('Already claimed, skipping');
        return;
      }

      // Check if already in the process of claiming
      if (isClaimingRef.current) {
        console.log('Already in the process of claiming, skipping');
        return;
      }

      // Check if we're in an error state - don't claim in that case
      if (adStatus === 'error') {
        console.log('In error state, skipping claim');
        return;
      }

      // Set mutex lock immediately to prevent race conditions
      isClaimingRef.current = true;
      hasClaimedRef.current = true;

      // Ensure user gets a cookie even if ad didn't fully load
      // This is a fallback to make sure users always get their reward
      if (window.adLoadedSuccessfully === undefined) {
        console.log('Ad load status unknown, assuming success for user experience');
        window.adLoadedSuccessfully = true;
      }

      try {
        // First, submit the game win to get a token
        console.log('Submitting game win...');
        const gameWinResponse = await CookieService.submitGameWin(150); // Score of 150

        if (!gameWinResponse.success || !gameWinResponse.token) {
          throw new Error(gameWinResponse.message || 'Failed to get token');
        }

        console.log('Game win successful, received token:', gameWinResponse.token);

        // Now use the token to claim a cookie
        console.log('Claiming cookie with token...');
        const cookieResponse = await CookieService.getAvailableCookie(gameWinResponse.token);

        // Check if the cookie claim was successful
        if (!cookieResponse.success) {
          // Handle specific error for no cookies available
          if (cookieResponse.message && cookieResponse.message.includes("No cookies available")) {
            throw new Error("We've run out of cookies for now. Please try again later!");
          }
          throw new Error(cookieResponse.message || 'Failed to claim cookie');
        }

        // For compatibility with the rest of the code
        const jsonResponse = {
          filename: cookieResponse.filename,
          content: cookieResponse.content,
          remainingCookies: cookieResponse.remainingCookies
        };

        console.log('Cookie claim successful:', jsonResponse);

        // If we got here, the cookie claim was successful

        // Use the already parsed JSON response
        if (jsonResponse) {
          try {
            // Create and trigger download
            const content = jsonResponse.content || '';
            const blob = new Blob([content], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = jsonResponse.filename || 'cookie.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            setAdStatus('completed');
            onAdComplete();

            // Show remaining cookies count if available
            if (jsonResponse.remainingCookies && jsonResponse.remainingCookies <= 10) {
              console.warn(`Only ${jsonResponse.remainingCookies} cookies remaining!`);
            }
          } catch (processError) {
            console.error('Error processing the cookie data:', processError);
            setError('Error processing the cookie data. Please try again.');
            setAdStatus('error');
            hasClaimedRef.current = false;
            return;
          }
        } else {
          console.error('No valid JSON response to process');
          setError('Error processing the cookie data. Please try again.');
          setAdStatus('error');
          hasClaimedRef.current = false;
          return;
        }

      } catch (error: any) {
        console.error('Prize claim error:', error);
        setError(error?.message || 'Failed to claim cookie');
        setAdStatus('error');
        hasClaimedRef.current = false; // Reset on error so user can try again
        isClaimingRef.current = false; // Release mutex lock
      } finally {
        // Always release the mutex lock after a delay
        setTimeout(() => {
          isClaimingRef.current = false;
          console.log('Mutex lock released');
        }, 5000); // 5 second cooldown
      }
    };

    // Start loading the ad
    loadAd();

    return () => {
      if (timer) clearInterval(timer);
      if (adCheckTimer) clearInterval(adCheckTimer);
    };
  }, [onAdComplete, onAdError]);

  const particles = Array.from({ length: 15 }, (_, i) => (
    <motion.div
      key={i}
      className="absolute w-2 h-2 bg-gray-500 rounded-full"
      initial={{
        x: 0,
        y: 0,
        scale: 0,
        opacity: 1
      }}
      animate={{
        x: Math.random() * 200 - 100,
        y: Math.random() * 200 - 100,
        scale: 0,
        opacity: 0
      }}
      transition={{
        duration: 1,
        repeat: Infinity,
        repeatDelay: Math.random() * 2
      }}
    />
  ));

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Background Tech Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjIiLz48L2c+PC9zdmc+')] opacity-50"></div>
      </div>

      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/50 via-gray-800/50 to-gray-900/50 animate-gradient-xy"></div>

      <div className="relative py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <div className="text-center mb-8 relative">
            {/* Tech Lines */}
            <div className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gray-500 to-transparent"></div>
            <div className="absolute left-0 right-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-gray-500 to-transparent"></div>

            <motion.h2
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-200 via-white to-gray-300 mb-4 tracking-tight"
            >
              Cookie Catcher <span className="text-4xl">v2.0</span>
            </motion.h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Experience the next generation of cookie rewards
            </p>
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="bg-gray-800/50 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-gray-700/50"
          >
            <div className="p-8">
              <AnimatePresence mode="wait">
                {adStatus === 'loading' && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="text-center p-8"
                  >
                    <div className="relative inline-block">
                      <div className="absolute inset-0 rounded-full blur-xl bg-gray-500/20"></div>
                      <div className="relative animate-spin rounded-full h-16 w-16 border-4 border-gray-500 border-t-transparent"></div>
                    </div>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-lg text-gray-300 mt-6"
                    >
                      Initializing reward protocol...
                    </motion.p>
                  </motion.div>
                )}

                {adStatus === 'watching' && (
                  <motion.div
                    key="watching"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="mb-8 text-center">
                      <div className="inline-block rounded-2xl bg-gray-700/30 p-4 mb-6 border border-gray-600/30">
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="text-3xl"
                        >
                          ⚡
                        </motion.div>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-100 mb-3">
                        System Engaged
                      </h3>
                      <div className="flex items-center justify-center space-x-2 text-gray-400">
                        <div className="w-2 h-2 rounded-full bg-gray-500 animate-pulse"></div>
                        <p>Processing reward in {timeLeft}s</p>
                      </div>
                    </div>

                    <div ref={adContainerRef} className="relative bg-gray-900/30 rounded-xl overflow-hidden border border-gray-700/30">
                      <div
                        ref={containerRef}
                        className={`flex items-center justify-center ${windowSize.width < 768 ? 'min-h-[100px]' : windowSize.width < 1024 ? 'min-h-[200px]' : 'min-h-[250px]'}`}
                      >
                        {/* Ad Space */}
                      </div>
                    </div>

                    <div className="mt-8">
                      <div className="relative">
                        <div className="absolute inset-0 blur-lg bg-gray-500/20"></div>
                        <div className="relative w-full bg-gray-700/30 rounded-full h-2 overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-gray-500 via-white to-gray-500"
                            style={{ width: `${((10 - timeLeft) / 10) * 100}%` }}
                            animate={{
                              backgroundPosition: ["0% 50%", "100% 50%"],
                            }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              ease: "linear"
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {adStatus === 'completed' && (
                  <motion.div
                    key="completed"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    className="text-center p-8 relative"
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      {particles}
                    </div>
                    <motion.div
                      animate={{
                        y: [0, -10, 0],
                        rotateZ: [0, -10, 10, 0]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="relative z-10"
                    >
                      <div className="text-8xl mb-6">🍪</div>
                    </motion.div>
                    <motion.h3
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-3xl font-bold text-gray-100 mb-4"
                    >
                      Mission Accomplished!
                    </motion.h3>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="text-gray-400"
                    >
                      Your reward has been successfully extracted
                    </motion.p>
                  </motion.div>
                )}

                {adStatus === 'error' && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-center p-6 bg-red-900/20 rounded-xl border border-red-700/30"
                  >
                    <motion.div
                      animate={{
                        rotate: [0, 3, -3, 0],
                        scale: [1, 1.05, 1]
                      }}
                      transition={{ duration: 0.5 }}
                      className="text-4xl mb-4"
                    >
                      {error && error.includes("run out of cookies") ? "🍪" : "⚠️"}
                    </motion.div>
                    <h3 className="text-xl font-bold text-gray-100 mb-2">
                      {error && error.includes("run out of cookies") ? "No Cookies Available" : "System Error Detected"}
                    </h3>
                    <p className="text-gray-300 mb-4 max-w-md mx-auto">
                      {error || 'Connection to reward system failed'}
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => window.location.reload()}
                      className="px-6 py-2 bg-gradient-to-r from-[#7B4ED8] to-[#9C5FE9] text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
                    >
                      {error && error.includes("run out of cookies") ? "Try Again Later" : "Retry"}
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Technical Footer */}
            <div className="bg-gray-800/50 border-t border-gray-700/50 px-8 py-4">
              <div className="flex items-center justify-between text-sm text-gray-400">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-gray-500 animate-pulse"></div>
                  <span>System Online</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span>Protocol v2.0</span>
                  <span>•</span>
                  <span>{new Date().getFullYear()}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdComponent;