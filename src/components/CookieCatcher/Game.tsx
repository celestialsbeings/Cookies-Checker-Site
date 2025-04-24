import React, { useEffect, useRef, useState, useCallback, Suspense, lazy } from 'react';
import { Cookie } from 'lucide-react';
import { CookieService } from '../../services/cookieService';

// Lazy load the AdComponent to reduce initial bundle size
const AdComponent = lazy(() => import('./AdComponent'));

// Game constants
const BASE_CANVAS_WIDTH = 800;
const BASE_CANVAS_HEIGHT = 600;
const BASE_COOKIE_SIZE = 40;
const BASE_BASKET_WIDTH = 80;
const BASE_BASKET_HEIGHT = 40;
const BASE_BASKET_SPEED = 14;
const BASE_COOKIE_SPEED = 300; // Pixels per second
const SPAWN_INTERVAL = 1000; // Base spawn interval in ms

interface Cookie {
  id: number;
  x: number;
  y: number;
  speed: number;
  isBad: boolean;
}

interface GameState {
  score: number;
  level: number;
  isGameOver: boolean;
  canClaimPrize: boolean;
  isWatchingAd: boolean;
}

const CookieCatcher: React.FC = () => {
  // Game state and refs
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    level: 1,
    isGameOver: false,
    canClaimPrize: false,
    isWatchingAd: false
  });

  const [cookies, setCookies] = useState<Cookie[]>([]);
  const [basketX, setBasketX] = useState(BASE_CANVAS_WIDTH / 2 - BASE_BASKET_WIDTH / 2);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [adError, setAdError] = useState<string | null>(null);

  // Responsive sizing state
  const [scale, setScale] = useState(1);
  const [canvasWidth, setCanvasWidth] = useState(BASE_CANVAS_WIDTH);
  const [canvasHeight, setCanvasHeight] = useState(BASE_CANVAS_HEIGHT);

  // Detect if device is mobile
  const [isMobile, setIsMobile] = useState(false);

  // Calculate scaled dimensions
  const COOKIE_SIZE = BASE_COOKIE_SIZE * scale;
  const BASKET_WIDTH = BASE_BASKET_WIDTH * scale;
  const BASKET_HEIGHT = BASE_BASKET_HEIGHT * scale;
  const BASKET_SPEED = BASE_BASKET_SPEED * scale;

  // Refs for game loop and movement
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const requestRef = useRef<number>();
  const lastFrameTime = useRef(performance.now());
  const lastSpawnTime = useRef(performance.now());
  const isPlayingRef = useRef(false);
  const cookiesRef = useRef<Cookie[]>([]);
  const basketXRef = useRef(BASE_CANVAS_WIDTH / 2 - BASE_BASKET_WIDTH / 2);
  const keysPressedRef = useRef(new Set<string>());
  const touchIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Update score handling
  const updateScore = useCallback((points: number) => {
    setGameState(prev => {
      const newScore = prev.score + points;
      const newLevel = Math.floor(newScore / 100) + 1;
      const canClaimPrize = newScore >= 200;

      // Stop the game if score reaches 200 or more
      if (canClaimPrize && !prev.canClaimPrize) {
        isPlayingRef.current = false;
      }

      return {
        ...prev,
        score: newScore,
        level: newLevel,
        canClaimPrize
      };
    });
  }, []);

  // Drawing functions
  const drawBackground = useCallback((ctx: CanvasRenderingContext2D) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(0.5, '#2d3250');
    gradient.addColorStop(1, '#424874');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  }, [canvasWidth, canvasHeight]);

  const drawBasket = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 5;

    const basketGradient = ctx.createLinearGradient(
      basketXRef.current,
      canvasHeight - BASKET_HEIGHT,
      basketXRef.current,
      canvasHeight
    );
    basketGradient.addColorStop(0, '#8B4513');
    basketGradient.addColorStop(1, '#654321');

    ctx.fillStyle = basketGradient;
    ctx.beginPath();
    ctx.moveTo(basketXRef.current, canvasHeight - BASKET_HEIGHT);
    ctx.lineTo(basketXRef.current + BASKET_WIDTH, canvasHeight - BASKET_HEIGHT);
    ctx.lineTo(basketXRef.current + BASKET_WIDTH - 5, canvasHeight);
    ctx.lineTo(basketXRef.current + 5, canvasHeight);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }, [canvasHeight, BASKET_WIDTH, BASKET_HEIGHT]);

  const drawCookie = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, isBad: boolean) => {
    ctx.save();

    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetY = 3;

    const cookieGradient = ctx.createRadialGradient(
      x + COOKIE_SIZE/2,
      y + COOKIE_SIZE/2,
      COOKIE_SIZE/6,
      x + COOKIE_SIZE/2,
      y + COOKIE_SIZE/2,
      COOKIE_SIZE/2
    );

    if (isBad) {
      cookieGradient.addColorStop(0, '#a00000');
      cookieGradient.addColorStop(1, '#800000');
    } else {
      cookieGradient.addColorStop(0, '#D2691E');
      cookieGradient.addColorStop(1, '#8B4513');
    }

    ctx.fillStyle = cookieGradient;
    ctx.beginPath();
    ctx.arc(x + COOKIE_SIZE/2, y + COOKIE_SIZE/2, COOKIE_SIZE/2, 0, Math.PI * 2);
    ctx.fill();

    if (isBad) {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('☠️', x + COOKIE_SIZE/2, y + COOKIE_SIZE/2);
    }

    ctx.restore();
  }, [COOKIE_SIZE]);

  // Game loop
  const gameLoop = useCallback(() => {
    if (!isPlayingRef.current || !contextRef.current) return;

    const ctx = contextRef.current;
    const currentTime = performance.now();
    const deltaTime = Math.min((currentTime - lastFrameTime.current) / 1000, 0.1);
    lastFrameTime.current = currentTime;

    // Clear and draw background
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    drawBackground(ctx);

    // Update basket position
    const speed = BASKET_SPEED * deltaTime * 60; // Make speed frame-rate independent
    if (keysPressedRef.current.has('ArrowLeft')) {
      const newX = Math.max(0, basketXRef.current - speed);
      basketXRef.current = newX;
      setBasketX(newX);
    }
    if (keysPressedRef.current.has('ArrowRight')) {
      const newX = Math.min(canvasWidth - BASKET_WIDTH, basketXRef.current + speed);
      basketXRef.current = newX;
      setBasketX(newX);
    }

    drawBasket(ctx);

    // Update cookies
    const updatedCookies = cookiesRef.current.reduce<Cookie[]>((acc, cookie) => {
      const updatedY = cookie.y + (cookie.speed * deltaTime);

      const collision =
        updatedY > canvasHeight - BASKET_HEIGHT - COOKIE_SIZE &&
        updatedY < canvasHeight - COOKIE_SIZE/2 &&
        cookie.x + COOKIE_SIZE > basketXRef.current &&
        cookie.x < basketXRef.current + BASKET_WIDTH;

      if (collision) {
        updateScore(cookie.isBad ? -20 : 10);
        return acc;
      }

      if (updatedY < canvasHeight) {
        const updatedCookie = { ...cookie, y: updatedY };
        drawCookie(ctx, updatedCookie.x, updatedCookie.y, updatedCookie.isBad);
        return [...acc, updatedCookie];
      }

      return acc;
    }, []);

    cookiesRef.current = updatedCookies;
    setCookies(updatedCookies);

    // Spawn cookies
    const spawnInterval = Math.max(SPAWN_INTERVAL - (gameState.level * 100), 300);
    if (currentTime - lastSpawnTime.current > spawnInterval) {
      const newCookie: Cookie = {
        id: Date.now(),
        x: Math.random() * (canvasWidth - COOKIE_SIZE),
        y: -COOKIE_SIZE,
        speed: BASE_COOKIE_SPEED * (1 + Math.random() * 0.4 + gameState.level * 0.1),
        isBad: Math.random() > (0.8 - gameState.level * 0.05)
      };

      cookiesRef.current = [...cookiesRef.current, newCookie];
      setCookies(prev => [...prev, newCookie]);
      lastSpawnTime.current = currentTime;
    }

    requestRef.current = requestAnimationFrame(gameLoop);
  }, [
    canvasWidth, canvasHeight,
    BASKET_WIDTH, BASKET_HEIGHT, BASKET_SPEED,
    COOKIE_SIZE, BASE_COOKIE_SPEED,
    drawBackground, drawBasket, drawCookie,
    updateScore, gameState.level
  ]);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    contextRef.current = ctx;
    drawBackground(ctx);
    drawBasket(ctx);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [canvasWidth, canvasHeight, drawBackground, drawBasket]);

  // Handle game state changes
  useEffect(() => {
    if (isPlaying) {
      lastFrameTime.current = performance.now();
      lastSpawnTime.current = performance.now();
      isPlayingRef.current = true;
      requestRef.current = requestAnimationFrame(gameLoop);
    } else {
      isPlayingRef.current = false;
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    }

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isPlaying, gameLoop]);

  // Game timer
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;

    if (isPlaying && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsPlaying(false);
            setGameState(prev => ({ ...prev, isGameOver: true }));
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [isPlaying, timeLeft]);

  // Sync refs with state
  useEffect(() => {
    cookiesRef.current = cookies;
  }, [cookies]);

  useEffect(() => {
    basketXRef.current = basketX;
  }, [basketX]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isPlayingRef.current) return;

      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        keysPressedRef.current.add(event.key);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        keysPressedRef.current.delete(event.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      keysPressedRef.current.clear();
    };
  }, []);

  // Handle touch events for game controls
  useEffect(() => {
    // Function to handle touch events on control buttons
    const handleTouchEvents = () => {
      const leftControl = document.getElementById('left-control');
      const rightControl = document.getElementById('right-control');

      if (leftControl) {
        leftControl.addEventListener('touchstart', (e) => {
          e.preventDefault();
          keysPressedRef.current.add('ArrowLeft');
        }, { passive: false });

        leftControl.addEventListener('touchend', (e) => {
          e.preventDefault();
          keysPressedRef.current.delete('ArrowLeft');
        }, { passive: false });
      }

      if (rightControl) {
        rightControl.addEventListener('touchstart', (e) => {
          e.preventDefault();
          keysPressedRef.current.add('ArrowRight');
        }, { passive: false });

        rightControl.addEventListener('touchend', (e) => {
          e.preventDefault();
          keysPressedRef.current.delete('ArrowRight');
        }, { passive: false });
      }
    };

    // Set a small timeout to ensure the DOM elements are available
    const timeoutId = setTimeout(handleTouchEvents, 100);

    return () => {
      clearTimeout(timeoutId);
      // Clean up is handled automatically when elements are removed
    };
  }, [isPlaying]);

  // Resize handler for mobile - maximized canvas size
  useEffect(() => {
    const handleResize = () => {
      const container = document.querySelector('.game-container');
      if (!container) return;

      // Use maximum screen space for the game
      const containerWidth = container.clientWidth;
      // Use 85% of viewport height for better gameplay on mobile
      const containerHeight = window.innerHeight * 0.85;

      // Calculate scale with minimal padding
      const horizontalScale = (containerWidth - 8) / BASE_CANVAS_WIDTH;
      const verticalScale = containerHeight / BASE_CANVAS_HEIGHT;

      // Allow larger scale for better visibility (up to 1.5x)
      const newScale = Math.min(horizontalScale, verticalScale, 1.5);

      setScale(newScale);
      setCanvasWidth(BASE_CANVAS_WIDTH * newScale);
      setCanvasHeight(BASE_CANVAS_HEIGHT * newScale);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial resize

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Touch control cleanup
  useEffect(() => {
    return () => {
      if (touchIntervalRef.current) {
        clearInterval(touchIntervalRef.current);
      }
    };
  }, []);

  // Detect if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsMobile(isTouchDevice);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Game control functions
  const startGame = useCallback(() => {
    setGameState({
      score: 0,
      level: 1,
      isGameOver: false,
      canClaimPrize: false,
      isWatchingAd: false
    });
    setTimeLeft(60);
    setCookies([]);
    cookiesRef.current = [];
    basketXRef.current = canvasWidth / 2 - BASKET_WIDTH / 2;
    setBasketX(basketXRef.current);
    setIsPlaying(true);
  }, [canvasWidth, BASKET_WIDTH]);

  // Handle prize claiming
  const handleClaimPrize = () => {
    if (!gameState.canClaimPrize || gameState.isWatchingAd) return;
    setGameState(prev => ({ ...prev, isWatchingAd: true }));
  };

  const handleAdComplete = async () => {
    try {
      // Get a token first
      const gameWinResponse = await CookieService.submitGameWin(200); // Score of 200

      if (!gameWinResponse.success || !gameWinResponse.token) {
        throw new Error(gameWinResponse.message || 'Failed to get token');
      }

      // Use the token to claim a cookie
      const result = await CookieService.getAvailableCookie(gameWinResponse.token);

      if (result.success) {
        setGameState(prev => ({
          ...prev,
          isWatchingAd: false,
          canClaimPrize: false
        }));
        alert(result.message);
      } else {
        setAdError(result.message);
      }
    } catch (error) {
      setAdError('Failed to claim prize. Please try again.');
    }
  };

  const handleAdError = (error: string) => {
    setAdError(error);
    setGameState(prev => ({ ...prev, isWatchingAd: false }));
  };

  return (
    <div className="game-container relative w-full max-w-2xl mx-auto px-0 py-0">
      {/* Claim Prize Overlay - Show when prize can be claimed */}
      {gameState.canClaimPrize && !gameState.isWatchingAd && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl max-w-sm w-full
                         shadow-xl border border-white/10 text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-yellow-500 to-amber-600
                          rounded-full flex items-center justify-center">
              <span className="text-4xl">🏆</span>
            </div>
            <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-yellow-400 to-amber-400
                          text-transparent bg-clip-text">Congratulations!</h2>
            <p className="text-gray-300 mb-6">You've reached {gameState.score} points! Claim your prize now!</p>
            <button
              onClick={handleClaimPrize}
              onTouchStart={(e) => {
                e.preventDefault();
                handleClaimPrize();
              }}
              className="w-full py-3 bg-gradient-to-r from-yellow-500 to-amber-600
                       rounded-xl font-semibold text-lg text-white
                       transition-all duration-300 active:scale-95
                       shadow-lg shadow-yellow-500/20 touch-none
                       hover:from-yellow-600 hover:to-amber-700
                       flex items-center justify-center gap-2"
            >
              <span className="text-2xl">🎉</span>
              <span>Claim Prize Cookie!</span>
              <span className="text-2xl">🍪</span>
            </button>
          </div>
        </div>
      )}

      <div className="relative">
        {/* Game Canvas */}
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          className="bg-gray-900 rounded-lg shadow-xl mx-auto touch-none"
          style={{
            width: `${canvasWidth}px`,
            height: `${canvasHeight}px`,
            willChange: 'transform',
            transform: 'translateZ(0)',
            touchAction: 'none',
          }}
        />

        {/* Game Controls - Hide when ad is showing */}
        {isPlaying && !gameState.isWatchingAd && !gameState.canClaimPrize && (
          <div className="game-controls">
            {/* Left Control Button */}
            <div
              id="left-control"
              className="control-button left-control"
              onTouchStart={() => keysPressedRef.current.add('ArrowLeft')}
              onTouchEnd={() => keysPressedRef.current.delete('ArrowLeft')}
              onMouseDown={() => keysPressedRef.current.add('ArrowLeft')}
              onMouseUp={() => keysPressedRef.current.delete('ArrowLeft')}
              onMouseLeave={() => keysPressedRef.current.delete('ArrowLeft')}
            >
              <div className="control-button-inner">
                <span className="control-arrow">←</span>
              </div>
            </div>

            {/* Right Control Button */}
            <div
              id="right-control"
              className="control-button right-control"
              onTouchStart={() => keysPressedRef.current.add('ArrowRight')}
              onTouchEnd={() => keysPressedRef.current.delete('ArrowRight')}
              onMouseDown={() => keysPressedRef.current.add('ArrowRight')}
              onMouseUp={() => keysPressedRef.current.delete('ArrowRight')}
              onMouseLeave={() => keysPressedRef.current.delete('ArrowRight')}
            >
              <div className="control-button-inner">
                <span className="control-arrow">→</span>
              </div>
            </div>
          </div>
        )}

        {/* Instructions - Show keyboard controls only on desktop */}
        {!isPlaying && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur rounded-lg
                        flex flex-col items-center justify-center text-white p-4">
            {gameState.isGameOver ? (
              <>
                <h2 className="text-2xl font-bold mb-2">Game Over!</h2>
                <p className="text-xl mb-1">Score: {gameState.score}</p>
                <p className="text-lg mb-4 opacity-80">Level {gameState.level}</p>
                <button
                  onClick={startGame}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    startGame();
                  }}
                  className="px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-600
                           rounded-lg font-semibold text-base hover:from-purple-600 hover:to-indigo-700
                           transition-all duration-300 active:scale-95
                           shadow-lg shadow-purple-500/20"
                >
                  Play Again
                </button>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-4">Cookie Catcher</h2>
                <div className="space-y-2 text-center mb-4">
                  {isMobile ? (
                    <div className="flex items-center gap-2 bg-white/5 p-2 rounded-lg">
                      <span className="text-xl">📱</span>
                      <p className="text-sm">Use buttons to move</p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 bg-white/5 p-2 rounded-lg">
                      <span className="text-xl">⌨️</span>
                      <p className="text-sm">Use arrow keys</p>
                    </div>
                  )}
                  <div className="flex items-center gap-2 bg-white/5 p-2 rounded-lg">
                    <span className="text-xl">🍪</span>
                    <p className="text-sm">+10 points</p>
                  </div>
                  <div className="flex items-center gap-2 bg-white/5 p-2 rounded-lg">
                    <span className="text-xl">☠️</span>
                    <p className="text-sm">-20 points</p>
                  </div>
                  <div className="flex items-center gap-2 bg-white/5 p-2 rounded-lg">
                    <span className="text-xl">🎯</span>
                    <p className="text-sm">200 points = prize!</p>
                  </div>
                </div>
                <button
                  onClick={startGame}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    startGame();
                  }}
                  className="px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-600
                           rounded-lg font-semibold text-base hover:from-purple-600 hover:to-indigo-700
                           transition-all duration-300 active:scale-95
                           shadow-lg shadow-purple-500/20 touch-none"
                >
                  Start Game
                </button>
              </>
            )}
          </div>
        )}

        <div className="mt-1 grid grid-cols-3 gap-1 mb-4">
          <div className="bg-gray-800/90 rounded-lg p-1">
            <div className="text-xs text-gray-400">Score</div>
            <div className="text-base font-bold text-white">{gameState.score}</div>
          </div>
          <div className="bg-gray-800/90 rounded-lg p-1">
            <div className="text-xs text-gray-400">Level</div>
            <div className="text-base font-bold text-white">{gameState.level}</div>
          </div>
          <div className="bg-gray-800/90 rounded-lg p-1">
            <div className="text-xs text-gray-400">Time</div>
            <div className="text-base font-bold text-white">{timeLeft}s</div>
          </div>
        </div>

        {gameState.isWatchingAd && (
          <Suspense fallback={
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#7B4ED8] border-t-transparent"></div>
            </div>
          }>
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-0 z-[9999]">
              <AdComponent
                onAdComplete={handleAdComplete}
                onAdError={handleAdError}
              />
              {adError && (
                <p className="absolute bottom-4 left-0 right-0 text-center text-red-500 text-sm">{adError}</p>
              )}
            </div>
          </Suspense>
        )}
      </div>
    </div>
  );
};

export default CookieCatcher;