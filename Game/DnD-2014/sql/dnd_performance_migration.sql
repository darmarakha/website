-- DnD 2014 Performance Migration
-- This migration updates the schema to support lightweight list loading and
-- separates the JSON payloads from the core indexed data to optimize loading.

-- Note: MySQL < 8.0 or standard MySQL 8.0 doesn't support 'ADD COLUMN IF NOT EXISTS'.
-- You may need to manually verify these columns don't already exist or run a procedure to add them safely.
-- For standard execution, assuming they do not exist:

-- 1. Ensure new columns exist on dnd_characters
ALTER TABLE `dnd_characters`
ADD COLUMN `local_character_id` varchar(80) DEFAULT NULL AFTER `id`,
ADD COLUMN `subrace` varchar(80) DEFAULT NULL AFTER `race`,
ADD COLUMN `languages_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL AFTER `subrace`,
ADD COLUMN `race_traits_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL AFTER `languages_json`,
ADD COLUMN `ability_scores_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL AFTER `alignment`,
ADD COLUMN `skill_proficiencies_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL AFTER `ability_scores_json`,
ADD COLUMN `gold` int(10) UNSIGNED NOT NULL DEFAULT 0 AFTER `inventory_json`,
ADD COLUMN `attacks_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL AFTER `gold`,
ADD COLUMN `ac` tinyint(3) UNSIGNED NOT NULL DEFAULT 10 AFTER `hp_current`,
ADD COLUMN `status` enum('active','archived') NOT NULL DEFAULT 'active' AFTER `player_notes`,
ADD COLUMN `personality_traits_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL AFTER `alignment`,
ADD COLUMN `ideal` text DEFAULT NULL AFTER `personality_traits_json`,
ADD COLUMN `bond` text DEFAULT NULL AFTER `ideal`,
ADD COLUMN `flaw` text DEFAULT NULL AFTER `bond`;

-- 2. Ensure new columns exist on dnd_campaign_members
ALTER TABLE `dnd_campaign_members`
ADD COLUMN `invite_status` enum('pending','accepted','declined') NOT NULL DEFAULT 'accepted' AFTER `permissions_json`;

-- 3. Add Performance Indexes
-- Index on dnd_characters to optimize summary list loading
CREATE INDEX `idx_campaign_status_user` ON `dnd_characters` (`campaign_id`, `status`, `user_id`);

-- Unique key on dnd_characters to prevent duplicate local_character_ids within a campaign
ALTER TABLE `dnd_characters` ADD UNIQUE KEY `uniq_dnd_characters_campaign_local` (`campaign_id`, `local_character_id`);

-- Index on dnd_save_snapshots to optimize snapshot lookups
CREATE INDEX `idx_campaign_id_id` ON `dnd_save_snapshots` (`campaign_id`, `id`);