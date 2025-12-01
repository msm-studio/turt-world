'use client';

import { Character, Level } from '@/db/supabase';
import { useState, useEffect } from 'react';

interface GameUIProps {
  character: Character;
  level: Level;
  deaths: number;
}

export function GameUI({ character, level, deaths }: GameUIProps) {
  const [time, setTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((t) => t + 0.1);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white p-4 rounded-lg">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-bold">Level:</span>
          <span>{level.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold">Character:</span>
          <span>{character.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold">Time:</span>
          <span>{time.toFixed(1)}s</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold">Deaths:</span>
          <span>{deaths}</span>
        </div>
      </div>
    </div>
  );
}

interface WinScreenProps {
  character: Character;
  level: Level;
  completionTime: number;
  deaths: number;
  onRestart: () => void;
  onMainMenu: () => void;
  onSubmitScore?: (playerName: string) => void;
}

export function WinScreen({
  character,
  level,
  completionTime,
  deaths,
  onRestart,
  onMainMenu,
  onSubmitScore,
}: WinScreenProps) {
  const [playerName, setPlayerName] = useState('');
  const [scoreSubmitted, setScoreSubmitted] = useState(false);

  const handleSubmit = () => {
    if (playerName.trim() && onSubmitScore) {
      onSubmitScore(playerName.trim());
      setScoreSubmitted(true);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gradient-to-b from-yellow-400 to-orange-500 rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
            Level Complete!
          </h1>
          <p className="text-2xl text-white mb-6">{level.name}</p>

          <div className="bg-white bg-opacity-20 rounded-lg p-6 mb-6 space-y-3">
            <div className="flex justify-between text-white text-lg">
              <span>Character:</span>
              <span className="font-bold">{character.name}</span>
            </div>
            <div className="flex justify-between text-white text-lg">
              <span>Time:</span>
              <span className="font-bold">{completionTime.toFixed(2)}s</span>
            </div>
            <div className="flex justify-between text-white text-lg">
              <span>Deaths:</span>
              <span className="font-bold">{deaths}</span>
            </div>
          </div>

          {!scoreSubmitted && onSubmitScore && (
            <div className="mb-6">
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-2 rounded-lg mb-2 text-gray-800"
                maxLength={20}
              />
              <button
                onClick={handleSubmit}
                disabled={!playerName.trim()}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition"
              >
                Submit Score
              </button>
            </div>
          )}

          {scoreSubmitted && (
            <p className="text-white mb-6">Score submitted! Thanks for playing!</p>
          )}

          <div className="space-y-3">
            <button
              onClick={onRestart}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition"
            >
              Play Again
            </button>
            <button
              onClick={onMainMenu}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition"
            >
              Main Menu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface LoseScreenProps {
  onRespawn: () => void;
}

export function LoseScreen({ onRespawn }: LoseScreenProps) {
  return (
    <div className="fixed inset-0 bg-red-900 bg-opacity-50 flex items-center justify-center z-40 pointer-events-none">
      <div className="text-6xl font-bold text-white drop-shadow-lg animate-pulse">
        Ouch!
      </div>
    </div>
  );
}
