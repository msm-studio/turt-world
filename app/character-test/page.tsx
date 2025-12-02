'use client';

import { useEffect, useRef } from 'react';

export default function CharacterTest() {
  const canvasRefs = [
    useRef<HTMLCanvasElement>(null),
    useRef<HTMLCanvasElement>(null),
    useRef<HTMLCanvasElement>(null),
    useRef<HTMLCanvasElement>(null),
  ];

  useEffect(() => {
    canvasRefs.forEach((ref, index) => {
      const canvas = ref.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Light background
      ctx.fillStyle = '#E8C3A0';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw the character option
      drawTurtleOption(ctx, index, 40, 60, 80, 120);
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8">🐢 Turtle Style Options</h1>

      <div className="grid grid-cols-2 gap-8 mb-12">
        {canvasRefs.map((ref, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Option {index + 1}</h2>
            <canvas
              ref={ref}
              width={160}
              height={200}
              className="border-2 border-gray-300 rounded"
            />
            <p className="mt-2 text-sm text-gray-600">
              {getOptionDescription('turtle', index)}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm">
          These are facing RIGHT (walking direction). The horizontal flip will happen automatically when walking left.
        </p>
      </div>
    </div>
  );
}

function getOptionDescription(animal: string, option: number): string {
  const descriptions = {
    turtle: [
      'Chibi style - big head, tiny body, huge eyes',
      'Classic cartoon - balanced proportions, friendly',
      'Realistic cute - natural turtle shape but simplified',
      'Minimalist - simple shapes, iconic silhouette'
    ]
  };
  return descriptions[animal as keyof typeof descriptions][option];
}

// TURTLE OPTIONS
function drawTurtleOption(
  ctx: CanvasRenderingContext2D,
  option: number,
  x: number,
  y: number,
  width: number,
  height: number
) {
  switch(option) {
    case 0:
      drawTurtleChibi(ctx, x, y, width, height);
      break;
    case 1:
      drawTurtleClassic(ctx, x, y, width, height);
      break;
    case 2:
      drawTurtleRealistic(ctx, x, y, width, height);
      break;
    case 3:
      drawTurtleMinimal(ctx, x, y, width, height);
      break;
  }
}

// Option 1: Chibi style - super cute, big head
function drawTurtleChibi(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
  ctx.save();

  // Shell (main body - large and round)
  const shellGradient = ctx.createRadialGradient(x + width/2, y + height*0.55, 0, x + width/2, y + height*0.55, width*0.5);
  shellGradient.addColorStop(0, '#4DAF4D');
  shellGradient.addColorStop(1, '#2D7B2D');

  ctx.fillStyle = shellGradient;
  ctx.beginPath();
  ctx.arc(x + width/2, y + height*0.55, width*0.45, 0, Math.PI * 2);
  ctx.fill();

  // Shell pattern
  ctx.strokeStyle = '#1a5c1a';
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(x + width/2, y + height*0.55, 8 + i*6, 0, Math.PI * 2);
    ctx.stroke();
  }

  // HUGE head (chibi style - head is disproportionately large)
  const headGradient = ctx.createRadialGradient(x + width*0.8, y + height*0.25, 0, x + width*0.8, y + height*0.25, 18);
  headGradient.addColorStop(0, '#4DAF4D');
  headGradient.addColorStop(1, '#3D9B3D');

  ctx.fillStyle = headGradient;
  ctx.beginPath();
  ctx.arc(x + width*0.8, y + height*0.25, 16, 0, Math.PI * 2);
  ctx.fill();

  // HUGE sparkly eyes
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(x + width*0.82, y + height*0.23, 5, 0, Math.PI * 2);
  ctx.fill();

  // Big white highlight
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(x + width*0.84, y + height*0.21, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Tiny smile
  ctx.strokeStyle = '#2D7B2D';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(x + width*0.8, y + height*0.3, 5, 0.2, Math.PI - 0.2);
  ctx.stroke();

  // Stubby little legs
  ctx.fillStyle = '#3D9B3D';
  ctx.beginPath();
  ctx.arc(x + width*0.7, y + height*0.85, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + width*0.35, y + height*0.88, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// Option 2: Classic cartoon style - balanced, friendly
function drawTurtleClassic(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
  ctx.save();

  // Shell (dome shape)
  const shellGradient = ctx.createLinearGradient(x, y + height*0.4, x, y + height*0.8);
  shellGradient.addColorStop(0, '#4DAF4D');
  shellGradient.addColorStop(1, '#2D7B2D');

  ctx.fillStyle = shellGradient;
  ctx.beginPath();
  ctx.ellipse(x + width*0.5, y + height*0.6, width*0.4, height*0.35, 0, 0, Math.PI * 2);
  ctx.fill();

  // Shell pattern (hexagons)
  ctx.strokeStyle = '#1a5c1a';
  ctx.lineWidth = 2;
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 2; col++) {
      ctx.beginPath();
      ctx.arc(x + width*0.35 + col*15, y + height*0.55 + row*12, 5, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // Head (oval, sticking out)
  ctx.fillStyle = '#3D9B3D';
  ctx.beginPath();
  ctx.ellipse(x + width*0.82, y + height*0.35, 11, 13, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eyes (on sides of head)
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(x + width*0.85, y + height*0.32, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(x + width*0.85, y + height*0.32, 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(x + width*0.86, y + height*0.31, 1, 0, Math.PI * 2);
  ctx.fill();

  // Mouth
  ctx.strokeStyle = '#2D7B2D';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x + width*0.78, y + height*0.4);
  ctx.quadraticCurveTo(x + width*0.82, y + height*0.42, x + width*0.86, y + height*0.4);
  ctx.stroke();

  // Legs (flipper-like)
  ctx.fillStyle = '#3D9B3D';
  ctx.beginPath();
  ctx.ellipse(x + width*0.65, y + height*0.82, 7, 11, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + width*0.35, y + height*0.85, 7, 10, -0.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// Option 3: Realistic cute - more natural proportions
function drawTurtleRealistic(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
  ctx.save();

  // Shell (more oval, realistic)
  const shellGradient = ctx.createRadialGradient(x + width*0.45, y + height*0.55, 0, x + width*0.45, y + height*0.55, width*0.45);
  shellGradient.addColorStop(0, '#4DAF4D');
  shellGradient.addColorStop(0.5, '#3D9B3D');
  shellGradient.addColorStop(1, '#2D7B2D');

  ctx.fillStyle = shellGradient;
  ctx.beginPath();
  ctx.ellipse(x + width*0.45, y + height*0.55, width*0.42, height*0.38, -0.1, 0, Math.PI * 2);
  ctx.fill();

  // Scutes (shell plates)
  ctx.fillStyle = '#2D7B2D';
  ctx.globalAlpha = 0.3;
  const scutes = [
    {x: 0.35, y: 0.5}, {x: 0.5, y: 0.5},
    {x: 0.35, y: 0.65}, {x: 0.5, y: 0.65}
  ];
  scutes.forEach(s => {
    ctx.beginPath();
    ctx.arc(x + width*s.x, y + height*s.y, 7, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1.0;

  // Smaller head (realistic proportions)
  ctx.fillStyle = '#3D9B3D';
  ctx.beginPath();
  ctx.ellipse(x + width*0.85, y + height*0.38, 9, 10, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Eye
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(x + width*0.87, y + height*0.36, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(x + width*0.88, y + height*0.35, 0.8, 0, Math.PI * 2);
  ctx.fill();

  // Wrinkly neck
  ctx.strokeStyle = '#2D7B2D';
  ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(x + width*0.7, y + height*0.42 + i*3);
    ctx.lineTo(x + width*0.77, y + height*0.42 + i*3);
    ctx.stroke();
  }

  // Realistic legs
  ctx.fillStyle = '#3D9B3D';
  ctx.beginPath();
  ctx.ellipse(x + width*0.7, y + height*0.8, 5, 10, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + width*0.3, y + height*0.83, 5, 9, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // Claws
  ctx.strokeStyle = '#2D7B2D';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 2; i++) {
    ctx.beginPath();
    ctx.moveTo(x + width*0.7 + i*3, y + height*0.88);
    ctx.lineTo(x + width*0.7 + i*3, y + height*0.92);
    ctx.stroke();
  }

  ctx.restore();
}

// Option 4: Minimalist - simple iconic shapes
function drawTurtleMinimal(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
  ctx.save();

  // Shell (simple circle)
  ctx.fillStyle = '#3D9B3D';
  ctx.beginPath();
  ctx.arc(x + width*0.5, y + height*0.58, width*0.4, 0, Math.PI * 2);
  ctx.fill();

  // Simple shell pattern (one circle)
  ctx.strokeStyle = '#2D7B2D';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x + width*0.5, y + height*0.58, width*0.25, 0, Math.PI * 2);
  ctx.stroke();

  // Head (simple circle)
  ctx.fillStyle = '#4DAF4D';
  ctx.beginPath();
  ctx.arc(x + width*0.82, y + height*0.32, 12, 0, Math.PI * 2);
  ctx.fill();

  // Simple dot eyes
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(x + width*0.84, y + height*0.3, 3, 0, Math.PI * 2);
  ctx.fill();

  // Simple curved smile
  ctx.strokeStyle = '#2D7B2D';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x + width*0.82, y + height*0.35, 6, 0.3, Math.PI - 0.3);
  ctx.stroke();

  // Simple nubs for legs (circles)
  ctx.fillStyle = '#3D9B3D';
  ctx.beginPath();
  ctx.arc(x + width*0.68, y + height*0.82, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + width*0.32, y + height*0.85, 8, 0, Math.PI * 2);
  ctx.fill();

  // Tiny tail
  ctx.beginPath();
  ctx.arc(x + width*0.15, y + height*0.6, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
