import { API_URL } from '../config.browser';

// Interface for game win response
interface GameWinResponse {
  success: boolean;
  token: string;
  message: string;
}

// Interface for game score
interface GameScore {
  score: number;
  level: number;
  time: number;
}

/**
 * Submit a game win to get a token for claiming a cookie
 * @param score The game score data
 * @returns A promise that resolves to the game win response
 */
export const submitGameWin = async (score: GameScore): Promise<GameWinResponse> => {
  try {
    const response = await fetch(`${API_URL}/api/game-win`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(score)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to submit game win');
    }

    return await response.json();
  } catch (error) {
    console.error('Error submitting game win:', error);
    throw error;
  }
};

export default {
  submitGameWin
};
