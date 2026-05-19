-- Migration for DnD 2014 module performance

-- 1. Ensure dnd_characters has the necessary columns and indexes
ALTER TABLE dnd_characters
  ADD COLUMN IF NOT EXISTS local_character_id VARCHAR(80) NULL AFTER id,
  ADD COLUMN IF NOT EXISTS subrace VARCHAR(100) NULL AFTER race,
  ADD COLUMN IF NOT EXISTS status VARCHAR(40) DEFAULT 'active' AFTER gm_notes;

-- Add indexes for faster query loading
CREATE INDEX idx_dnd_chars_summary ON dnd_characters (campaign_id, status, user_id, updated_at);
CREATE UNIQUE INDEX uniq_dnd_chars_campaign_local ON dnd_characters (campaign_id, local_character_id);

-- 2. Ensure dnd_save_snapshots has indexes for the limit query
CREATE INDEX idx_dnd_snapshots_cleanup ON dnd_save_snapshots (campaign_id, id);

-- (Assuming json columns like languages_json, race_traits_json, personality_traits_json,
-- ability_scores_json, skill_proficiencies_json, appearance_json, inventory_json, attacks_json,
-- and locked_fields_json were created previously or are part of the base schema)
