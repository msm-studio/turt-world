'use client';

import { useState, useEffect } from 'react';
import { Character, Level, LeaderboardEntry, getCharacters, getLevels, getTopScores, submitScore } from '@/db/supabase';
import CharacterSelect from './CharacterSelect';
import Canvas from './Canvas';
import { GameUI, WinScreen } from './UI';

export default function Game() {
  const [gameState, setGameState] = useState<'loading' | 'character-select' | 'playing' | 'win'>(
    'loading'
  );
  const [characters, setCharacters] = useState<Character[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [topScores, setTopScores] = useState<LeaderboardEntry[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [currentLevel, setCurrentLevel] = useState<Level | null>(null);
  const [deaths, setDeaths] = useState(0);
  const [completionTime, setCompletionTime] = useState(0);
  const [score, setScore] = useState(0);
  const [coinsCollected, setCoinsCollected] = useState(0);
  const [totalCoins, setTotalCoins] = useState(0);
  const [currentCombo, setCurrentCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);

  useEffect(() => {
    loadGameData();
  }, []);

  const loadGameData = async () => {
    const [charactersData, levelsData, topScoresData] = await Promise.all([
      getCharacters(),
      getLevels(),
      getTopScores(5),
    ]);

    setCharacters(charactersData);
    setLevels(levelsData);
    setTopScores(topScoresData);

    if (levelsData.length > 0) {
      setCurrentLevel(levelsData[0]);
    }

    setGameState('character-select');
  };

  const handleCharacterSelect = (character: Character) => {
    setSelectedCharacter(character);
    setDeaths(0);
    setScore(0);
    setCoinsCollected(0);
    setTotalCoins(0);
    setCurrentCombo(0);
    setMaxCombo(0);
    setGameState('playing');
  };

  const handleLevelComplete = (
    time: number,
    deathCount: number,
    finalScore: number,
    coins: number,
    total: number,
    combo: number
  ) => {
    setCompletionTime(time);
    setDeaths(deathCount);
    setScore(finalScore);
    setCoinsCollected(coins);
    setTotalCoins(total);
    setMaxCombo(combo);
    setGameState('win');
  };

  const handleGameUpdate = (
    currentScore: number,
    coins: number,
    total: number,
    combo: number
  ) => {
    setScore(currentScore);
    setCoinsCollected(coins);
    setTotalCoins(total);
    setCurrentCombo(combo);
  };

  const handleLevelFailed = () => {
    setDeaths((d) => d + 1);
  };

  const handleRestart = () => {
    setDeaths(0);
    setScore(0);
    setCoinsCollected(0);
    setTotalCoins(0);
    setCurrentCombo(0);
    setMaxCombo(0);
    setGameState('playing');
  };

  const handleMainMenu = async () => {
    setSelectedCharacter(null);
    setDeaths(0);
    // Reload leaderboard to show any new scores
    const topScoresData = await getTopScores(5);
    setTopScores(topScoresData);
    setGameState('character-select');
  };

  const handleSubmitScore = async (playerName: string) => {
    if (selectedCharacter && currentLevel) {
      await submitScore(
        playerName,
        selectedCharacter.name,
        currentLevel.id,
        completionTime,
        deaths,
        score,
        coinsCollected,
        maxCombo
      );
    }
  };

  if (gameState === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-400 to-orange-300 flex items-center justify-center">
        <div className="text-4xl font-bold text-white">Loading Turt World...</div>
      </div>
    );
  }

  if (gameState === 'character-select') {
    return <CharacterSelect characters={characters} topScores={topScores} onSelect={handleCharacterSelect} />;
  }

  if (gameState === 'playing' && selectedCharacter && currentLevel) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-8 relative">
        <Canvas
          width={1400}
          height={600}
          character={selectedCharacter}
          level={currentLevel}
          onLevelComplete={handleLevelComplete}
          onLevelFailed={handleLevelFailed}
          onGameUpdate={handleGameUpdate}
        />
        <GameUI
          character={selectedCharacter}
          level={currentLevel}
          deaths={deaths}
          score={score}
          coinsCollected={coinsCollected}
          totalCoins={totalCoins}
          currentCombo={currentCombo}
        />
      </div>
    );
  }

  if (gameState === 'win' && selectedCharacter && currentLevel) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <WinScreen
          character={selectedCharacter}
          level={currentLevel}
          completionTime={completionTime}
          deaths={deaths}
          score={score}
          coinsCollected={coinsCollected}
          totalCoins={totalCoins}
          maxCombo={maxCombo}
          onRestart={handleRestart}
          onMainMenu={handleMainMenu}
          onSubmitScore={handleSubmitScore}
        />
      </div>
    );
  }

  return null;
}
