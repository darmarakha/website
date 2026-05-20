-- Safe / Idempotent SQL Migration for DnD 2014 Performance & Schema Updates
-- Safe to run multiple times on shared hosting MySQL environments.

DELIMITER //

CREATE PROCEDURE `gemu_dnd_safe_migration_v1`()
BEGIN
    DECLARE db_name VARCHAR(255);
    SELECT DATABASE() INTO db_name;

    -- 1. dnd_characters columns
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = db_name AND TABLE_NAME = 'dnd_characters' AND COLUMN_NAME = 'local_character_id') THEN
        ALTER TABLE `dnd_characters` ADD COLUMN `local_character_id` varchar(80) DEFAULT NULL AFTER `id`;
    END IF;

    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = db_name AND TABLE_NAME = 'dnd_characters' AND COLUMN_NAME = 'subrace') THEN
        ALTER TABLE `dnd_characters` ADD COLUMN `subrace` varchar(80) DEFAULT NULL AFTER `race`;
    END IF;

    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = db_name AND TABLE_NAME = 'dnd_characters' AND COLUMN_NAME = 'languages_json') THEN
        ALTER TABLE `dnd_characters` ADD COLUMN `languages_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL AFTER `subrace`;
    END IF;

    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = db_name AND TABLE_NAME = 'dnd_characters' AND COLUMN_NAME = 'race_traits_json') THEN
        ALTER TABLE `dnd_characters` ADD COLUMN `race_traits_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL AFTER `languages_json`;
    END IF;

    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = db_name AND TABLE_NAME = 'dnd_characters' AND COLUMN_NAME = 'ability_scores_json') THEN
        ALTER TABLE `dnd_characters` ADD COLUMN `ability_scores_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL AFTER `alignment`;
    END IF;

    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = db_name AND TABLE_NAME = 'dnd_characters' AND COLUMN_NAME = 'skill_proficiencies_json') THEN
        ALTER TABLE `dnd_characters` ADD COLUMN `skill_proficiencies_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL AFTER `ability_scores_json`;
    END IF;

    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = db_name AND TABLE_NAME = 'dnd_characters' AND COLUMN_NAME = 'gold') THEN
        ALTER TABLE `dnd_characters` ADD COLUMN `gold` int(10) UNSIGNED NOT NULL DEFAULT 0 AFTER `inventory_json`;
    END IF;

    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = db_name AND TABLE_NAME = 'dnd_characters' AND COLUMN_NAME = 'attacks_json') THEN
        ALTER TABLE `dnd_characters` ADD COLUMN `attacks_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL AFTER `gold`;
    END IF;

    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = db_name AND TABLE_NAME = 'dnd_characters' AND COLUMN_NAME = 'ac') THEN
        ALTER TABLE `dnd_characters` ADD COLUMN `ac` tinyint(3) UNSIGNED NOT NULL DEFAULT 10 AFTER `hp_current`;
    END IF;

    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = db_name AND TABLE_NAME = 'dnd_characters' AND COLUMN_NAME = 'status') THEN
        ALTER TABLE `dnd_characters` ADD COLUMN `status` enum('active','archived') NOT NULL DEFAULT 'active' AFTER `player_notes`;
    END IF;

    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = db_name AND TABLE_NAME = 'dnd_characters' AND COLUMN_NAME = 'personality_traits_json') THEN
        ALTER TABLE `dnd_characters` ADD COLUMN `personality_traits_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL AFTER `alignment`;
    END IF;

    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = db_name AND TABLE_NAME = 'dnd_characters' AND COLUMN_NAME = 'ideal') THEN
        ALTER TABLE `dnd_characters` ADD COLUMN `ideal` text DEFAULT NULL AFTER `personality_traits_json`;
    END IF;

    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = db_name AND TABLE_NAME = 'dnd_characters' AND COLUMN_NAME = 'bond') THEN
        ALTER TABLE `dnd_characters` ADD COLUMN `bond` text DEFAULT NULL AFTER `ideal`;
    END IF;

    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = db_name AND TABLE_NAME = 'dnd_characters' AND COLUMN_NAME = 'flaw') THEN
        ALTER TABLE `dnd_characters` ADD COLUMN `flaw` text DEFAULT NULL AFTER `bond`;
    END IF;

    -- 2. dnd_campaign_members columns
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = db_name AND TABLE_NAME = 'dnd_campaign_members' AND COLUMN_NAME = 'invite_status') THEN
        ALTER TABLE `dnd_campaign_members` ADD COLUMN `invite_status` enum('pending','accepted','declined') NOT NULL DEFAULT 'accepted' AFTER `permissions_json`;
    END IF;

    -- 3. Indexes
    -- dnd_characters: idx_campaign_status_user
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = db_name AND TABLE_NAME = 'dnd_characters' AND INDEX_NAME = 'idx_campaign_status_user') THEN
        CREATE INDEX `idx_campaign_status_user` ON `dnd_characters` (`campaign_id`, `status`, `user_id`);
    END IF;

    -- dnd_characters: uniq_dnd_characters_campaign_local
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = db_name AND TABLE_NAME = 'dnd_characters' AND INDEX_NAME = 'uniq_dnd_characters_campaign_local') THEN
        ALTER TABLE `dnd_characters` ADD UNIQUE KEY `uniq_dnd_characters_campaign_local` (`campaign_id`, `local_character_id`);
    END IF;

    -- dnd_save_snapshots: idx_campaign_id_id
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = db_name AND TABLE_NAME = 'dnd_save_snapshots' AND INDEX_NAME = 'idx_campaign_id_id') THEN
        CREATE INDEX `idx_campaign_id_id` ON `dnd_save_snapshots` (`campaign_id`, `id`);
    END IF;

END //

DELIMITER ;

-- Execute the procedure
CALL `gemu_dnd_safe_migration_v1`();

-- Clean up the procedure so it doesn't clutter the DB
DROP PROCEDURE IF EXISTS `gemu_dnd_safe_migration_v1`;