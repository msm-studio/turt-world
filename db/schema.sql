-- Turt World Database Schema
-- Run this in your Supabase SQL editor

-- Characters table
CREATE TABLE IF NOT EXISTS characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  speed DECIMAL NOT NULL,
  jump_force DECIMAL NOT NULL,
  mass DECIMAL NOT NULL,
  air_control DECIMAL NOT NULL,
  float_time DECIMAL DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Levels table
CREATE TABLE IF NOT EXISTS levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  theme TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  layout JSONB NOT NULL,
  unlocked_by_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leaderboard table
CREATE TABLE IF NOT EXISTS leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name TEXT NOT NULL,
  character_name TEXT NOT NULL,
  level_id UUID REFERENCES levels(id) ON DELETE CASCADE,
  completion_time DECIMAL NOT NULL,
  deaths INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default characters
INSERT INTO characters (name, speed, jump_force, mass, air_control, float_time, description) VALUES
  ('Turtle', 3.0, 12.0, 2.0, 0.3, 0, 'Slower but heavier with less air control'),
  ('Pig', 4.5, 13.0, 1.5, 0.5, 0, 'Balanced physics with faster acceleration'),
  ('Lemur', 4.0, 15.0, 1.0, 0.8, 0, 'Lightweight with extra air control and higher jumps'),
  ('Axolotl', 2.5, 12.0, 1.2, 0.6, 0.3, 'Slowest movement but can float slightly longer in air')
ON CONFLICT (name) DO NOTHING;

-- Insert Desert level
INSERT INTO levels (name, theme, order_index, unlocked_by_default, layout) VALUES
  ('Sandy Scramble', 'Desert', 1, TRUE, '{
    "background": {
      "color": "#F4A460",
      "layers": [
        {"type": "sky", "color": "#87CEEB"},
        {"type": "dunes", "color": "#DEB887", "parallax": 0.3}
      ]
    },
    "platforms": [
      {"x": 50, "y": 550, "width": 200, "height": 20, "type": "ground"},
      {"x": 300, "y": 450, "width": 150, "height": 20, "type": "sand"},
      {"x": 500, "y": 350, "width": 120, "height": 20, "type": "sand"},
      {"x": 700, "y": 280, "width": 100, "height": 20, "type": "sand"},
      {"x": 900, "y": 350, "width": 150, "height": 20, "type": "sand"},
      {"x": 1100, "y": 450, "width": 200, "height": 20, "type": "ground"}
    ],
    "hazards": [
      {"x": 450, "y": 580, "width": 40, "height": 60, "type": "cactus"},
      {"x": 650, "y": 580, "width": 40, "height": 60, "type": "cactus"},
      {"x": 850, "y": 580, "width": 40, "height": 60, "type": "cactus"}
    ],
    "start": {"x": 100, "y": 450},
    "goal": {"x": 1150, "y": 350, "width": 60, "height": 80}
  }')
ON CONFLICT DO NOTHING;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_leaderboard_level ON leaderboard(level_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_time ON leaderboard(completion_time);
CREATE INDEX IF NOT EXISTS idx_levels_order ON levels(order_index);
