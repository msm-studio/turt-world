'use client';

import { useState, useEffect } from 'react';
import { Character, Level, getCharacters, getLevels, submitScore } from '@/db/supabase';
import CharacterSelect from './CharacterSelect';
import Canvas from './Canvas';
import { GameUI, WinScreen } from './UI';

export default function Game() {
  const [gameState, setGameState] = useState<'loading' | 'character-select' | 'playing' | 'win'>(
    'loading'
  );
  const [characters, setCharacters] = useState<Character[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [currentLevel, setCurrentLevel] = useState<Level | null>(null);
  const [deaths, setDeaths] = useState(0);
  const [completionTime, setCompletionTime] = useState(0);

  useEffect(() => {
    loadGameData();
  }, []);

  const loadGameData = async () => {
    const [charactersData, levelsData] = await Promise.all([getCharacters(), getLevels()]);

    setCharacters(charactersData);
    setLevels(levelsData);

    if (levelsData.length > 0) {
      setCurrentLevel(levelsData[0]);
    }

    setGameState('character-select');
  };

  const handleCharacterSelect = (character: Character) => {
    setSelectedCharacter(character);
    setDeaths(0);
    setGameState('playing');
  };

  const handleLevelComplete = (time: number, deathCount: number) => {
    setCompletionTime(time);
    setDeaths(deathCount);
    setGameState('win');
  };

  const handleLevelFailed = () => {
    setDeaths((d) => d + 1);
  };

  const handleRestart = () => {
    setDeaths(0);
    setGameState('playing');
  };

  const handleMainMenu = () => {
    setSelectedCharacter(null);
    setDeaths(0);
    setGameState('character-select');
  };

  const handleSubmitScore = async (playerName: string) => {
    if (selectedCharacter && currentLevel) {
      await submitScore(
        playerName,
        selectedCharacter.name,
        currentLevel.id,
        completionTime,
        deaths
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
    return <CharacterSelect characters={characters} onSelect={handleCharacterSelect} />;
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
        />
        <GameUI character={selectedCharacter} level={currentLevel} deaths={deaths} />
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
          onRestart={handleRestart}
          onMainMenu={handleMainMenu}
          onSubmitScore={handleSubmitScore}
        />
      </div>
    );
  }

  return null;
}
