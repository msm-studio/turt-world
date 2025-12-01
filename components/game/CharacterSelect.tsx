'use client';

import { Character } from '@/db/supabase';

interface CharacterSelectProps {
  characters: Character[];
  onSelect: (character: Character) => void;
}

const characterColors: Record<string, string> = {
  Turtle: 'bg-green-600 hover:bg-green-700',
  Pig: 'bg-pink-400 hover:bg-pink-500',
  Lemur: 'bg-amber-700 hover:bg-amber-800',
  Axolotl: 'bg-pink-600 hover:bg-pink-700',
};

const characterEmojis: Record<string, string> = {
  Turtle: '🐢',
  Pig: '🐷',
  Lemur: '🦧',
  Axolotl: '🦎',
};

export default function CharacterSelect({ characters, onSelect }: CharacterSelectProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 to-orange-300 flex flex-col items-center justify-center p-8">
      <div className="text-center mb-12">
        <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-lg">
          Turt World
        </h1>
        <p className="text-2xl text-white drop-shadow">Choose Your Character</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl">
        {characters.map((character) => (
          <button
            key={character.id}
            onClick={() => onSelect(character)}
            className={`${
              characterColors[character.name] || 'bg-gray-600 hover:bg-gray-700'
            } text-white rounded-2xl p-8 shadow-2xl transform transition-all hover:scale-105 active:scale-95 flex flex-col items-center gap-4 min-w-[200px]`}
          >
            <div className="text-7xl mb-2">{characterEmojis[character.name] || '🦔'}</div>
            <h2 className="text-3xl font-bold">{character.name}</h2>
            <p className="text-sm opacity-90 text-center">{character.description}</p>

            <div className="mt-4 w-full bg-white bg-opacity-20 rounded-lg p-3 text-xs space-y-1">
              <div className="flex justify-between">
                <span>Speed:</span>
                <span className="font-bold">{character.speed.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span>Jump:</span>
                <span className="font-bold">{character.jump_force.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span>Air Control:</span>
                <span className="font-bold">
                  {(character.air_control * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-12 text-white text-center">
        <p className="text-lg mb-2">Controls</p>
        <p className="text-sm opacity-75">Arrow Keys or WASD to move • Space or W to jump</p>
      </div>
    </div>
  );
}
