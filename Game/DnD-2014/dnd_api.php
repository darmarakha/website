<?php
global $_GEMU_DB;
if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

global $_dnd_timing_logs;
$_dnd_timing_logs = [];

function dnd_add_timing_log(string $step, float $start_time) {
    global $_dnd_timing_logs;
    $ms = round((microtime(true) - $start_time) * 1000, 2);
    $_dnd_timing_logs[] = ['step' => $step, 'ms' => $ms];
}

function dnd_json(array $payload, int $code = 200): void {
    global $_dnd_timing_logs;

    // Add debugTiming if it's safe (Owner or Admin role based on project requirement)
    $role = strtolower((string)($_SESSION['gy_user_role'] ?? $_SESSION['user_role'] ?? $_SESSION['role'] ?? ''));
    if (in_array($role, ['owner', 'admin'], true)) {
        if (!empty($_dnd_timing_logs)) {
            $payload['debugTiming'] = $_dnd_timing_logs;
        }
    }

    http_response_code($code);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    dnd_json(['ok' => false, 'message' => 'Method tidak valid.'], 405);
}

$raw = file_get_contents('php://input') ?: '';
if (strlen($raw) > 2500000) {
    dnd_json(['ok' => false, 'message' => 'Payload terlalu besar.'], 413);
}
$input = json_decode($raw, true);
if (!is_array($input)) {
    dnd_json(['ok' => false, 'message' => 'JSON tidak valid.'], 400);
}

$sessionToken = (string)($_SESSION['gemu_dnd_token'] ?? '');
$clientToken = (string)($input['token'] ?? '');
if ($sessionToken === '' || !hash_equals($sessionToken, $clientToken)) {
    dnd_json(['ok' => false, 'message' => 'Token DND tidak valid. Refresh halaman lalu coba lagi.'], 403);
}

function dnd_load_database_config(): array {
    $candidates = [
        __DIR__ . '/../../config/database.php',
        __DIR__ . '/../../config/db.php',
        __DIR__ . '/../../db.php',
        __DIR__ . '/../config/database.php',
        __DIR__ . '/../config/db.php',
        __DIR__ . '/dnd_db.php',
    ];
    $result = ['pdo' => null, 'config' => null];
    foreach ($candidates as $file) {
        if (!is_file($file)) continue;
        global $_GEMU_DB; // Ensure config is available globally for gemu_db_connect
        $pdo = null; $conn = null; $db = null; $database = null; $config = null;
        $host = null; $dbname = null; $username = null; $user = null; $password = null; $pass = null; $dsn = null;
        $included = include $file;
        if ($included instanceof PDO) {
            $result['pdo'] = $included;
            break;
        }
        if (is_array($included)) {
            $result['config'] = $included;
        }
        if (isset($pdo) && $pdo instanceof PDO) {
            $result['pdo'] = $pdo;
            break;
        }
        if (isset($conn) && $conn instanceof PDO) {
            $result['pdo'] = $conn;
            break;
        }
        foreach ([$config, $db, $database, $GLOBALS['_GEMU_DB'] ?? null] as $candidate) {
            if (is_array($candidate)) {
                $result['config'] = $candidate;
                break 2;
            }
        }
        $flat = array_filter([
            'host' => $host,
            'dbname' => $dbname,
            'database' => $database,
            'name' => $dbname,
            'user' => $user ?: $username,
            'username' => $username ?: $user,
            'pass' => $pass ?: $password,
            'password' => $password ?: $pass,
            'dsn' => $dsn,
        ], static fn($v) => $v !== null && $v !== '');
        if ($flat) {
            $result['config'] = $flat;
            break;
        }
        if (function_exists('gemu_db_connect') || function_exists('get_dnd_pdo')) {
            break;
        }
    }
    return $result;
}

function dnd_pdo_from_config_array(array $config): ?PDO {
    $dbConfig = $config['dnd'] ?? $config['DND'] ?? $config;
    if (isset($dbConfig['database']) && !isset($dbConfig['dbname'])) $dbConfig['dbname'] = $dbConfig['database'];
    if (isset($dbConfig['name']) && !isset($dbConfig['dbname'])) $dbConfig['dbname'] = $dbConfig['name'];
    if (isset($dbConfig['username']) && !isset($dbConfig['user'])) $dbConfig['user'] = $dbConfig['username'];
    if (isset($dbConfig['password']) && !isset($dbConfig['pass'])) $dbConfig['pass'] = $dbConfig['password'];
    $host = (string)($dbConfig['host'] ?? 'localhost');
    $dbname = (string)($dbConfig['dbname'] ?? (defined('DND_DB_NAME') ? DND_DB_NAME : 'httpgemu_dnd'));
    $user = (string)($dbConfig['user'] ?? '');
    $pass = (string)($dbConfig['pass'] ?? '');
    $dsn = (string)($dbConfig['dsn'] ?? ('mysql:host=' . $host . ';dbname=' . $dbname . ';charset=utf8mb4'));
    if ($user === '' && stripos($dsn, 'mysql:') === 0) return null;
    return new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
}

function dnd_make_pdo(): PDO {
    $loaded = dnd_load_database_config();

    if (function_exists('gemu_db_connect')) {
        $ref = new ReflectionFunction('gemu_db_connect');
        return $ref->getNumberOfParameters() > 0 ? gemu_db_connect('dnd') : gemu_db_connect();
    }
    if (function_exists('get_dnd_pdo')) {
        return get_dnd_pdo();
    }
    if (($loaded['config'] ?? null) && is_array($loaded['config'])) {
        $fromConfig = dnd_pdo_from_config_array($loaded['config']);
        if ($fromConfig instanceof PDO) return $fromConfig;
    }
    if (($loaded['pdo'] ?? null) instanceof PDO) {
        return $loaded['pdo'];
    }
    if (isset($GLOBALS['pdo']) && $GLOBALS['pdo'] instanceof PDO) {
        return $GLOBALS['pdo'];
    }
    if (defined('DND_DB_HOST') && defined('DND_DB_NAME') && defined('DND_DB_USER')) {
        $dsn = 'mysql:host=' . DND_DB_HOST . ';dbname=' . DND_DB_NAME . ';charset=utf8mb4';
        return new PDO($dsn, DND_DB_USER, defined('DND_DB_PASS') ? DND_DB_PASS : '', [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
    }
    throw new RuntimeException('Konfigurasi database DND tidak ditemukan. Pastikan config/database.php punya koneksi dnd atau buat DnD-2014/dnd_db.php.');
}

function dnd_prepare_database(PDO $pdo): void {
    // Prioritas wajib: pakai database DND sendiri. Jangan tersesat ke httpgemu_website
    // meskipun pernah ada tabel dnd_* yang tidak sengaja ter-import di database website.
    $databaseName = defined('DND_DB_NAME') ? DND_DB_NAME : 'httpgemu_dnd';
    $safeDatabaseName = str_replace('`', '``', $databaseName);
    $dndError = null;

    try {
        $pdo->exec('USE `' . $safeDatabaseName . '`');
        $pdo->query('SELECT 1 FROM dnd_campaigns LIMIT 1');
        return;
    } catch (Throwable $e) {
        $dndError = $e->getMessage();
    }

    try {
        $pdo->query('SELECT 1 FROM dnd_campaigns LIMIT 1');
        return;
    } catch (Throwable $e) {
        throw new RuntimeException('Database DND belum siap atau tabel DND belum ditemukan. Target `' . $databaseName . '`: ' . $dndError . ' | database aktif: ' . $e->getMessage());
    }
}

try {
    $pdo = dnd_make_pdo();
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    dnd_prepare_database($pdo);
} catch (Throwable $e) {
    error_log('[DND SQL] connection failed: ' . $e->getMessage());
    dnd_json(['ok' => false, 'message' => 'SQL DND belum tersambung. Penyimpanan lokal dimatikan agar data tidak bercabang.'], 200);
}

$userIdRaw = $_SESSION['gy_user_id'] ?? $_SESSION['user_id'] ?? $_SESSION['id_user'] ?? $_SESSION['id'] ?? null;
$userId = is_numeric($userIdRaw) ? (int)$userIdRaw : null;
$userName = trim((string)($_SESSION['gy_nickname'] ?? $_SESSION['gy_user_name'] ?? $_SESSION['user_name'] ?? $_SESSION['nama_panggilan'] ?? $_SESSION['nama_lengkap'] ?? 'Guest Player'));
$userRole = strtolower((string)($_SESSION['gy_user_role'] ?? $_SESSION['user_role'] ?? $_SESSION['role'] ?? 'member'));
$isOwner = in_array($userRole, ['owner', 'admin', 'gm'], true);

if (!$userId) {
    dnd_json(['ok' => false, 'message' => 'Login website dulu. Akun DND lokal sudah dimatikan supaya akun dan karakter hanya tersimpan di MySQL.'], 401);
}

function dnd_get_campaign_id(PDO $pdo, ?int $userId, bool $isOwner): int {
    if ($userId) {
        $stmt = $pdo->prepare('SELECT id FROM dnd_campaigns WHERE owner_user_id = :uid ORDER BY id ASC LIMIT 1');
        $stmt->execute([':uid' => $userId]);
        $id = $stmt->fetchColumn();
        if ($id) return (int)$id;
    }

    $stmt = $pdo->query("SELECT id FROM dnd_campaigns WHERE status IN ('active','draft','paused') ORDER BY id ASC LIMIT 1");
    $id = $stmt->fetchColumn();
    if ($id) return (int)$id;

    $stmt = $pdo->prepare("INSERT INTO dnd_campaigns (owner_user_id, name, party_level, play_mode, voice_external, starting_mode, starting_gold, safety_notes, status, settings_json) VALUES (:uid, 'Gemuyokai Frontier', 1, 'offline', 0, 'standard', 10, 'D20 2014 rules helper aktif', 'active', JSON_OBJECT())");
    $stmt->execute([':uid' => $isOwner ? $userId : null]);
    return (int)$pdo->lastInsertId();
}

function dnd_save_campaign_settings(PDO $pdo, int $campaignId, array $state): void {
    $campaign = is_array($state['campaign'] ?? null) ? $state['campaign'] : [];
    $name = trim((string)($campaign['name'] ?? 'Gemuyokai Frontier')) ?: 'Gemuyokai Frontier';
    $partyLevel = max(1, min(20, (int)($campaign['partyLevel'] ?? 1)));
    $playMode = in_array(($campaign['playMode'] ?? 'offline'), ['offline','online'], true) ? $campaign['playMode'] : 'offline';
    $voiceExternal = !empty($campaign['voiceExternal']) ? 1 : 0;
    $voicePlatform = trim((string)($campaign['voicePlatform'] ?? '')) ?: null;
    $startingMode = in_array(($campaign['startingMode'] ?? 'standard'), ['standard','gold','custom'], true) ? $campaign['startingMode'] : 'standard';
    $startingGold = max(0, min(999999, (int)($campaign['startingGold'] ?? 10)));
    $startingCustomName = trim((string)($campaign['startingCustomName'] ?? '')) ?: null;
    $customItems = array_values(array_filter(array_map('trim', explode(',', (string)($campaign['startingCustomItems'] ?? '')))));
    $safety = trim((string)($campaign['safety'] ?? 'D20 2014 rules helper aktif'));
    $settingsJson = json_encode($campaign, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $itemsJson = json_encode($customItems, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    $stmt = $pdo->prepare('UPDATE dnd_campaigns SET name=:name, party_level=:party, play_mode=:play_mode, voice_external=:voice_external, voice_platform=:voice_platform, starting_mode=:starting_mode, starting_gold=:starting_gold, starting_custom_name=:starting_custom_name, starting_custom_items_json=:items_json, safety_notes=:safety, settings_json=:settings_json WHERE id=:id');
    $stmt->execute([
        ':name' => mb_substr($name, 0, 150),
        ':party' => $partyLevel,
        ':play_mode' => $playMode,
        ':voice_external' => $voiceExternal,
        ':voice_platform' => $voicePlatform ? mb_substr($voicePlatform, 0, 120) : null,
        ':starting_mode' => $startingMode,
        ':starting_gold' => $startingGold,
        ':starting_custom_name' => $startingCustomName ? mb_substr($startingCustomName, 0, 140) : null,
        ':items_json' => $itemsJson,
        ':safety' => $safety,
        ':settings_json' => $settingsJson,
        ':id' => $campaignId,
    ]);
}


function dnd_table_has_column(PDO $pdo, string $table, string $column): bool {
    $stmt = $pdo->prepare("SHOW COLUMNS FROM `$table` LIKE :col");
    $stmt->execute([':col' => $column]);
    return (bool)$stmt->fetch();
}

function dnd_json_value($value): string {
    return json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?: '[]';
}

function dnd_gm_timer_active(?string $expiresAt): bool {
    $expiresAt = trim((string)$expiresAt);
    if ($expiresAt === '') return true;
    $time = strtotime($expiresAt);
    return $time !== false && $time > time();
}

function dnd_account_id_to_user_id($accountId, array $account = []): ?int {
    if (isset($account['websiteUserId']) && is_numeric($account['websiteUserId'])) return (int)$account['websiteUserId'];
    if (isset($account['sqlUserId']) && is_numeric($account['sqlUserId'])) return (int)$account['sqlUserId'];
    if (is_numeric($accountId)) return (int)$accountId;
    if (preg_match('/^sql-user-(\d+)$/', (string)$accountId, $m)) return (int)$m[1];
    return null;
}

function dnd_sync_current_member(PDO $pdo, int $campaignId, ?int $userId, string $userName, bool $isOwner): void {
    if (!$userId) return;
    // dnd_ensure_member_columns removed for performance
    $displayName = mb_substr($userName ?: 'Player', 0, 120);
    $find = $pdo->prepare('SELECT id, role, permissions_json FROM dnd_campaign_members WHERE campaign_id=:cid AND user_id=:uid LIMIT 1');
    $find->execute([':cid' => $campaignId, ':uid' => $userId]);
    $row = $find->fetch();
    $oldPermissions = dnd_decode_json_field($row['permissions_json'] ?? null, []);
    $oldRole = (string)($row['role'] ?? 'player');
    $oldGmActive = ($oldRole === 'gm' || !empty($oldPermissions['gm'])) && dnd_gm_timer_active($oldPermissions['gm_expires_at'] ?? '');
    $nextRole = $isOwner ? 'gm' : ($oldGmActive ? 'gm' : 'player');
    $permissions = [
        'player' => true,
        'gm' => $isOwner || $oldGmActive,
        'owner' => $isOwner,
        'hidden_gm' => $isOwner,
        'visible_role' => ($isOwner || $oldGmActive) ? 'gm' : 'player',
        'gm_expires_at' => (!$isOwner && $oldGmActive) ? (string)($oldPermissions['gm_expires_at'] ?? '') : '',
        'gm_granted_at' => (!$isOwner && $oldGmActive) ? (string)($oldPermissions['gm_granted_at'] ?? '') : '',
        'gm_granted_by' => (!$isOwner && $oldGmActive) ? (string)($oldPermissions['gm_granted_by'] ?? '') : '',
    ];
    $payload = dnd_json_value($permissions);
    if ($row) {
        $stmt = $pdo->prepare('UPDATE dnd_campaign_members SET role=:role, display_name=:display_name, permissions_json=:permissions_json, invite_status=:invite_status WHERE id=:id');
        $stmt->execute([
            ':id' => (int)$row['id'],
            ':role' => $nextRole,
            ':display_name' => $displayName,
            ':permissions_json' => $payload,
            ':invite_status' => 'accepted',
        ]);
    } else {
        $stmt = $pdo->prepare('INSERT INTO dnd_campaign_members (campaign_id, user_id, role, display_name, permissions_json, invite_status) VALUES (:cid, :uid, :role, :display_name, :permissions_json, :invite_status)');
        $stmt->execute([
            ':cid' => $campaignId,
            ':uid' => $userId,
            ':role' => $nextRole,
            ':display_name' => $displayName,
            ':permissions_json' => $payload,
            ':invite_status' => 'accepted',
        ]);
    }
}

function dnd_sync_accounts(PDO $pdo, int $campaignId, array $state, ?int $ownerUserId, bool $isOwner): void {
    if (!$isOwner) return;
    // dnd_ensure_member_columns removed for performance
    $accounts = is_array($state['accounts'] ?? null) ? $state['accounts'] : [];
    $stmt = $pdo->prepare('INSERT INTO dnd_campaign_members (campaign_id, user_id, display_name, role, permissions_json, invite_status) VALUES (:cid, :uid, :display_name, :role, :permissions_json, :invite_status) ON DUPLICATE KEY UPDATE display_name=VALUES(display_name), role=VALUES(role), permissions_json=VALUES(permissions_json), invite_status=VALUES(invite_status)');
    foreach ($accounts as $account) {
        if (!is_array($account) || ($account['source'] ?? '') !== 'website') continue;
        $accountId = (string)($account['id'] ?? '');
        $targetUserId = dnd_account_id_to_user_id($accountId, $account);
        if (!$targetUserId) continue;
        $accountIsOwner = stripos((string)($account['name'] ?? ''), 'darma') !== false || stripos((string)($account['email'] ?? ''), 'darma') !== false;
        $roleRaw = strtolower((string)($account['role'] ?? 'player'));
        $expiresAt = trim((string)($account['gmExpiresAt'] ?? ''));
        $gmActive = !$accountIsOwner && $roleRaw === 'gm' && dnd_gm_timer_active($expiresAt);
        $role = $accountIsOwner ? 'gm' : ($gmActive ? 'gm' : 'player');
        $permissions = [
            'player' => true,
            'gm' => $accountIsOwner || $gmActive,
            'owner' => $accountIsOwner,
            'hidden_gm' => $accountIsOwner,
            'visible_role' => ($accountIsOwner || $gmActive) ? 'gm' : 'player',
            'gm_expires_at' => $gmActive ? $expiresAt : '',
            'gm_granted_at' => $gmActive ? (string)($account['gmGrantedAt'] ?? '') : '',
            'gm_granted_by' => $gmActive ? (string)($account['gmGrantedBy'] ?? $ownerUserId ?? '') : '',
        ];
        $stmt->execute([
            ':cid' => $campaignId,
            ':uid' => $targetUserId,
            ':display_name' => mb_substr(trim((string)($account['name'] ?? 'Player')) ?: 'Player', 0, 120),
            ':role' => $role,
            ':permissions_json' => dnd_json_value($permissions),
            ':invite_status' => 'accepted',
        ]);
    }
}

function dnd_sync_characters(PDO $pdo, int $campaignId, array $state, ?int $userId, bool $isOwner): void {
    // dnd_ensure_character_columns removed for performance
    $characters = is_array($state['characters'] ?? null) ? $state['characters'] : [];
    if (!$characters) return;

    $stmtUpsert = $pdo->prepare('INSERT INTO dnd_characters
        (campaign_id, local_character_id, user_id, name, race, subrace, languages_json, race_traits_json, class_name, level, background, alignment, personality_traits_json, ideal, bond, flaw, ability_scores_json, skill_proficiencies_json, appearance_json, inventory_json, gold, attacks_json, hp_max, hp_current, ac, speed, locked_fields_json, gm_notes, status, inspiration, hit_dice)
        VALUES
        (:campaign_id, :local_character_id, :user_id, :name, :race, :subrace, :languages_json, :race_traits_json, :class_name, :level, :background, :alignment, :personality_traits_json, :ideal, :bond, :flaw, :ability_scores_json, :skill_proficiencies_json, :appearance_json, :inventory_json, :gold, :attacks_json, :hp_max, :hp_current, :ac, :speed, :locked_fields_json, :gm_notes, :status, :inspiration, :hit_dice)
        ON DUPLICATE KEY UPDATE
        user_id=VALUES(user_id), name=VALUES(name), race=VALUES(race), subrace=VALUES(subrace), languages_json=VALUES(languages_json), race_traits_json=VALUES(race_traits_json), class_name=VALUES(class_name), level=VALUES(level), background=VALUES(background), alignment=VALUES(alignment), personality_traits_json=VALUES(personality_traits_json), ideal=VALUES(ideal), bond=VALUES(bond), flaw=VALUES(flaw), ability_scores_json=VALUES(ability_scores_json), skill_proficiencies_json=VALUES(skill_proficiencies_json), appearance_json=VALUES(appearance_json), inventory_json=VALUES(inventory_json), gold=VALUES(gold), attacks_json=VALUES(attacks_json), hp_max=VALUES(hp_max), hp_current=VALUES(hp_current), ac=VALUES(ac), speed=VALUES(speed), locked_fields_json=VALUES(locked_fields_json), gm_notes=VALUES(gm_notes), status=VALUES(status), inspiration=VALUES(inspiration), hit_dice=VALUES(hit_dice), updated_at=CURRENT_TIMESTAMP');

    $seen = [];
    foreach ($characters as $character) {
        if (!is_array($character)) continue;
        $localId = trim((string)($character['id'] ?? ''));
        if ($localId === '') $localId = 'char_' . substr(sha1(json_encode($character)), 0, 18);
        $seen[] = $localId;
        $ownerRaw = $character['ownerId'] ?? null;
        $ownerId = null;
        if (is_numeric($ownerRaw)) {
            $ownerId = (int)$ownerRaw;
        } elseif (is_string($ownerRaw) && preg_match('/^sql-user-(\d+)$/', $ownerRaw, $m)) {
            $ownerId = (int)$m[1];
        } elseif (isset($character['websiteUserId']) && is_numeric($character['websiteUserId'])) {
            $ownerId = (int)$character['websiteUserId'];
        } elseif (isset($character['sqlUserId']) && is_numeric($character['sqlUserId'])) {
            $ownerId = (int)$character['sqlUserId'];
        } else {
            $ownerId = $userId;
        }

        $stmtUpsert->execute([
            ':campaign_id' => $campaignId,
            ':local_character_id' => mb_substr($localId, 0, 80),
            ':user_id' => $ownerId,
            ':name' => mb_substr(trim((string)($character['name'] ?? 'Nameless Adventurer')), 0, 140),
            ':race' => mb_substr((string)($character['race'] ?? 'human'), 0, 80),
            ':subrace' => mb_substr((string)($character['subrace'] ?? ''), 0, 80) ?: null,
            ':languages_json' => dnd_json_value($character['languages'] ?? []),
            ':race_traits_json' => dnd_json_value($character['raceTraits'] ?? $character['traits'] ?? []),
            ':class_name' => mb_substr((string)($character['className'] ?? 'fighter'), 0, 80),
            ':level' => max(1, min(20, (int)($character['level'] ?? 1))),
            ':background' => mb_substr((string)($character['background'] ?? 'Folk Hero'), 0, 120),
            ':alignment' => mb_substr((string)($character['alignment'] ?? 'True Neutral'), 0, 80),
            ':personality_traits_json' => dnd_json_value($character['personalityTraits'] ?? []),
            ':ideal' => mb_substr((string)($character['ideal'] ?? ''), 0, 2000) ?: null,
            ':bond' => mb_substr((string)($character['bond'] ?? ''), 0, 2000) ?: null,
            ':flaw' => mb_substr((string)($character['flaw'] ?? ''), 0, 2000) ?: null,
            ':ability_scores_json' => dnd_json_value($character['abilities'] ?? []),
            ':skill_proficiencies_json' => dnd_json_value($character['skills'] ?? []),
            ':appearance_json' => dnd_json_value($character['appearance'] ?? []),
            ':inventory_json' => dnd_json_value($character['inventory'] ?? []),
            ':gold' => max(0, (int)($character['gold'] ?? 0)),
            ':attacks_json' => dnd_json_value($character['attacks'] ?? []),
            ':hp_max' => max(1, (int)($character['hpMax'] ?? 1)),
            ':hp_current' => max(0, (int)($character['hpCurrent'] ?? ($character['hpMax'] ?? 1))),
            ':ac' => max(1, (int)($character['ac'] ?? 10)),
            ':speed' => max(0, (int)($character['speed'] ?? 30)),
            ':locked_fields_json' => dnd_json_value($character['startingChoice'] ?? []),
            ':gm_notes' => mb_substr((string)($character['gmNotes'] ?? ''), 0, 2000),
            ':status' => 'active',
            ':inspiration' => !empty($character['inspiration']) ? 1 : 0,
            ':hit_dice' => mb_substr((string)($character['hitDice'] ?? ''), 0, 20),
        ]);
    }

    if ($seen) {
        $placeholders = [];
        $params = [':cid' => $campaignId];
        foreach ($seen as $i => $id) {
            $key = ':id' . $i;
            $placeholders[] = $key;
            $params[$key] = mb_substr($id, 0, 80);
        }
        $sql = 'UPDATE dnd_characters SET status = "archived" WHERE campaign_id = :cid AND local_character_id IS NOT NULL AND local_character_id NOT IN (' . implode(',', $placeholders) . ')';
        if (!$isOwner && $userId) {
            $sql .= ' AND user_id = :uid_archiver';
            $params[':uid_archiver'] = $userId;
        }
        $pdo->prepare($sql)->execute($params);
    }
}
function dnd_decode_json_field($value, $fallback = []) {
    if ($value === null || $value === '') return $fallback;
    if (is_array($value)) return $value;
    $decoded = json_decode((string)$value, true);
    return is_array($decoded) ? $decoded : $fallback;
}

function dnd_state_from_sql(PDO $pdo, int $campaignId, ?int $userId, bool $isOwner): array {
    $stmt = $pdo->prepare('SELECT * FROM dnd_campaigns WHERE id = :id LIMIT 1');
    $stmt->execute([':id' => $campaignId]);
    $campaignRow = $stmt->fetch() ?: [];
    $campaignSettings = dnd_decode_json_field($campaignRow['settings_json'] ?? null, []);
    $campaign = array_merge([
        'name' => $campaignRow['name'] ?? 'Gemuyokai Frontier',
        'partyLevel' => (int)($campaignRow['party_level'] ?? 1),
        'safety' => $campaignRow['safety_notes'] ?? 'D20 2014 rules helper aktif',
        'playMode' => $campaignRow['play_mode'] ?? 'offline',
        'voiceExternal' => !empty($campaignRow['voice_external']),
        'voicePlatform' => $campaignRow['voice_platform'] ?? '',
        'startingMode' => $campaignRow['starting_mode'] ?? 'standard',
        'startingGold' => (int)($campaignRow['starting_gold'] ?? 10),
        'startingCustomName' => $campaignRow['starting_custom_name'] ?? 'GM Custom Choice',
        'startingCustomItems' => implode(', ', dnd_decode_json_field($campaignRow['starting_custom_items_json'] ?? null, [])),
        'lastSaved' => date('c'),
    ], is_array($campaignSettings) ? $campaignSettings : []);

    // dnd_ensure_member_columns removed for performance
    $memberStmt = $pdo->prepare('SELECT * FROM dnd_campaign_members WHERE campaign_id = :cid AND invite_status = "accepted" ORDER BY joined_at ASC, id ASC');
    $memberStmt->execute([':cid' => $campaignId]);
    $accounts = [];
    while ($member = $memberStmt->fetch()) {
        $memberUserId = (int)($member['user_id'] ?? 0);
        if (!$memberUserId) continue;
        $permissions = dnd_decode_json_field($member['permissions_json'] ?? null, []);
        $isMemberOwner = !empty($permissions['owner']) || !empty($permissions['hidden_gm']);
        $gmActive = ($member['role'] === 'gm' || !empty($permissions['gm'])) && dnd_gm_timer_active($permissions['gm_expires_at'] ?? '');
        $accountRole = $isMemberOwner ? 'owner' : ($gmActive ? 'gm' : 'player');
        $accounts[] = [
            'id' => ($userId && $memberUserId === $userId) ? 'php-session-user' : ('sql-user-' . $memberUserId),
            'name' => $member['display_name'] ?: ('Player ' . $memberUserId),
            'email' => '',
            'role' => $accountRole,
            'visibleRole' => $accountRole === 'owner' ? 'player' : $accountRole,
            'dndRoles' => $isMemberOwner ? ['owner','player','gm'] : ($gmActive ? ['player','gm'] : ['player']),
            'hiddenGmPower' => $isMemberOwner,
            'gmExpiresAt' => $gmActive ? (string)($permissions['gm_expires_at'] ?? '') : '',
            'gmGrantedAt' => $gmActive ? (string)($permissions['gm_granted_at'] ?? '') : '',
            'gmGrantedBy' => $gmActive ? (string)($permissions['gm_granted_by'] ?? '') : '',
            'source' => 'website',
            'websiteUserId' => $memberUserId,
            'createdAt' => $member['joined_at'] ?? date('c'),
            'updatedAt' => date('c'),
        ];
    }

    $where = 'campaign_id = :cid AND status = "active"';
    $params = [':cid' => $campaignId];
    if (!$isOwner && $userId) {
        $where .= ' AND user_id = :uid';
        $params[':uid'] = $userId;
    }
    // Only select lightweight columns for summary to avoid heavy JSON decoding on list load
    $stmt = $pdo->prepare('SELECT id, local_character_id, user_id, name, race, subrace, class_name, level, hp_max, hp_current, ac, updated_at FROM dnd_characters WHERE ' . $where . ' ORDER BY updated_at DESC, id DESC');
    $stmt->execute($params);
    $characters = [];
    while ($row = $stmt->fetch()) {
        $rowUserId = (int)($row['user_id'] ?? 0);
        $ownerId = ($userId && $rowUserId === $userId) ? 'php-session-user' : ('sql-user-' . $rowUserId);
        $characters[] = [
            'id' => $row['local_character_id'] ?: ('sql-char-' . (int)$row['id']),
            'ownerId' => $ownerId,
            'websiteUserId' => $rowUserId,
            'name' => $row['name'] ?: 'Nameless Adventurer',
            'race' => $row['race'] ?: 'human',
            'subrace' => $row['subrace'] ?: '',
            'className' => $row['class_name'] ?: 'fighter',
            'level' => max(1, (int)($row['level'] ?? 1)),
            'hpMax' => max(1, (int)($row['hp_max'] ?? 1)),
            'hpCurrent' => max(0, (int)($row['hp_current'] ?? 1)),
            'ac' => max(1, (int)($row['ac'] ?? 10)),
            'updatedAt' => $row['updated_at'] ?? date('c'),
        ];
    }

    return [
        'version' => 1,
        'currentUserId' => 'php-session-user',
        'activeCharacterId' => $characters[0]['id'] ?? '',
        'activeMapId' => '',
        'accounts' => $accounts,
        'characters' => $characters,
        'maps' => [],
        'npcs' => [],
        'customItems' => [],
        'rollLog' => [],
        'sessionLog' => [],
        'aiNotes' => [],
        'campaign' => $campaign,
        'ui' => [
            'tab' => 'lobby',
            'showAuth' => false,
            'authMode' => 'login',
            'selectedNpcId' => '',
            'diceResult' => 20,
            'diceLabel' => 'd20',
            'diceDetail' => 'single die',
            'aiAnswer' => '',
            'search' => '',
            'showImport' => false,
            'showReward' => false,
            'showPdfChoice' => false,
            'characterStep' => 'race',
            'characterDraft' => null,
            'abilityRollLog' => null,
            'abilityPickAssignments' => [],
            'isVoiceNarrationActive' => false,
        ],
    ];
}
try {
    $request_start = microtime(true);
    $action = (string)($input['action'] ?? '');
    dnd_add_timing_log('db_connect', $request_start);

    $campaign_lookup_start = microtime(true);
    $campaignId = dnd_get_campaign_id($pdo, $userId, $isOwner);
    dnd_add_timing_log('campaign_lookup', $campaign_lookup_start);

    $member_sync_start = microtime(true);
    dnd_sync_current_member($pdo, $campaignId, $userId, $userName, $isOwner);
    dnd_add_timing_log('member_sync', $member_sync_start);

    if ($action === 'load') {
        $sql_state_build_start = microtime(true);
        $state = dnd_state_from_sql($pdo, $campaignId, $userId, $isOwner);
        dnd_add_timing_log('sql_state_build', $sql_state_build_start);

        $saved_at = null;
        $force_snapshot = !empty($input['force_snapshot']);

        // Fallback or force logic
        if ($force_snapshot || empty($state['accounts'])) {
            $snapshot_lookup_start = microtime(true);
            $stmt = $pdo->prepare('SELECT state_json, created_at FROM dnd_save_snapshots WHERE campaign_id = :cid ORDER BY id DESC LIMIT 1');
            $stmt->execute([':cid' => $campaignId]);
            $row = $stmt->fetch();
            dnd_add_timing_log('snapshot_lookup', $snapshot_lookup_start);
            
            $snapshot_state = $row ? json_decode($row['state_json'], true) : null;
            if (is_array($snapshot_state)) {
                $saved_at = $row['created_at'] ?? null;
                $snapshot_state['accounts'] = $state['accounts'] ?? ($snapshot_state['accounts'] ?? []);
                $snapshot_state['characters'] = $state['characters'] ?? [];

                if (empty($snapshot_state['activeCharacterId']) && !empty($state['activeCharacterId'])) {
                    $snapshot_state['activeCharacterId'] = $state['activeCharacterId'];
                }
                $state = $snapshot_state;
                $state['_snapshot_fallback_used'] = true;
            }
        }

        $response_ready_start = microtime(true);
        dnd_add_timing_log('response_ready', $response_ready_start);

        dnd_json([
            'ok' => true,
            'campaign_id' => $campaignId,
            'state' => $state,
            'saved_at' => $saved_at,
        ]);
    }

    if ($action === 'load_character') {
        $character_id = $input['character_id'] ?? '';
        if (!$character_id) {
            dnd_json(['ok' => false, 'message' => 'ID karakter tidak valid.'], 400);
        }
        $detail_query_start = microtime(true);
        $stmt = $pdo->prepare('SELECT * FROM dnd_characters WHERE campaign_id = :cid AND (local_character_id = :id OR id = :id_num) LIMIT 1');
        $stmt->execute([':cid' => $campaignId, ':id' => $character_id, ':id_num' => is_numeric($character_id) ? (int)$character_id : 0]);
        $row = $stmt->fetch();
        dnd_add_timing_log('character_detail_query', $detail_query_start);

        if (!$row) {
            dnd_json(['ok' => false, 'message' => 'Karakter tidak ditemukan.']);
        }

        $rowUserId = (int)($row['user_id'] ?? 0);
        $ownerId = ($userId && $rowUserId === $userId) ? 'php-session-user' : ('sql-user-' . $rowUserId);

        $character = [
            'id' => $row['local_character_id'] ?: ('sql-char-' . (int)$row['id']),
            'ownerId' => $ownerId,
            'websiteUserId' => $rowUserId,
            'name' => $row['name'] ?: 'Nameless Adventurer',
            'race' => $row['race'] ?: 'human',
            'subrace' => $row['subrace'] ?: '',
            'className' => $row['class_name'] ?: 'fighter',
            'level' => max(1, (int)($row['level'] ?? 1)),
            'hpMax' => max(1, (int)($row['hp_max'] ?? 1)),
            'hpCurrent' => max(0, (int)($row['hp_current'] ?? 1)),
            'ac' => max(1, (int)($row['ac'] ?? 10)),
            'speed' => max(0, (int)($row['speed'] ?? 30)),
            'background' => $row['background'] ?: '',
            'alignment' => $row['alignment'] ?: '',
            'inspiration' => !empty($row['inspiration']),
            'hitDice' => $row['hit_dice'] ?: '',
            'ideal' => $row['ideal'] ?: '',
            'bond' => $row['bond'] ?: '',
            'flaw' => $row['flaw'] ?: '',
            'gold' => (int)($row['gold'] ?? 0),
            'gmNotes' => $row['gm_notes'] ?: '',
            'status' => $row['status'] ?: 'active',
            'languages' => dnd_decode_json_field($row['languages_json'] ?? null, []),
            'raceTraits' => dnd_decode_json_field($row['race_traits_json'] ?? null, []),
            'personalityTraits' => dnd_decode_json_field($row['personality_traits_json'] ?? null, []),
            'abilityScores' => dnd_decode_json_field($row['ability_scores_json'] ?? null, []),
            'skillProficiencies' => dnd_decode_json_field($row['skill_proficiencies_json'] ?? null, []),
            'appearance' => dnd_decode_json_field($row['appearance_json'] ?? null, []),
            'inventory' => dnd_decode_json_field($row['inventory_json'] ?? null, []),
            'attacks' => dnd_decode_json_field($row['attacks_json'] ?? null, []),
            'lockedFields' => dnd_decode_json_field($row['locked_fields_json'] ?? null, []),
            'updatedAt' => $row['updated_at'] ?? date('c'),
        ];

        $response_ready_start = microtime(true);
        dnd_add_timing_log('response_ready', $response_ready_start);

        dnd_json(['ok' => true, 'character' => $character]);
    }

    if ($action === 'save_character') {
        $character = $input['character'] ?? null;
        if (!is_array($character)) {
            dnd_json(['ok' => false, 'message' => 'Data karakter tidak valid.'], 400);
        }
        $pdo->beginTransaction();
        dnd_sync_characters($pdo, $campaignId, ['characters' => [$character]], $userId, $isOwner);
        $pdo->commit();

        $response_ready_start = microtime(true);
        dnd_add_timing_log('response_ready', $response_ready_start);

        dnd_json(['ok' => true, 'message' => 'Karakter berhasil disimpan.']);
    }

    if ($action === 'save_campaign') {
        $campaign = $input['campaign'] ?? null;
        if (!is_array($campaign)) {
            dnd_json(['ok' => false, 'message' => 'Data campaign tidak valid.'], 400);
        }
        $pdo->beginTransaction();
        dnd_save_campaign_settings($pdo, $campaignId, ['campaign' => $campaign]);
        $pdo->commit();

        $response_ready_start = microtime(true);
        dnd_add_timing_log('response_ready', $response_ready_start);

        dnd_json(['ok' => true, 'message' => 'Campaign berhasil disimpan.']);
    }

    if ($action === 'save') {
        $state = $input['state'] ?? null;
        if (!is_array($state)) {
            dnd_json(['ok' => false, 'message' => 'State DND tidak valid.'], 400);
        }
        $state['version'] = $state['version'] ?? 1;
        $stateJson = json_encode($state, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        if ($stateJson === false || strlen($stateJson) > 2400000) {
            dnd_json(['ok' => false, 'message' => 'State DND gagal diproses atau terlalu besar.'], 400);
        }
        $pdo->beginTransaction();
        dnd_save_campaign_settings($pdo, $campaignId, $state);
        dnd_sync_accounts($pdo, $campaignId, $state, $userId, $isOwner);
        dnd_sync_characters($pdo, $campaignId, $state, $userId, $isOwner);
        $snapshotName = trim((string)($input['snapshot_name'] ?? 'Autosave DND 2014')) ?: 'Autosave DND 2014';
        $stmt = $pdo->prepare('INSERT INTO dnd_save_snapshots (campaign_id, created_by_user_id, snapshot_name, state_json) VALUES (:cid, :uid, :name, :state_json)');
        $stmt->execute([
            ':cid' => $campaignId,
            ':uid' => $userId,
            ':name' => mb_substr($snapshotName, 0, 160),
            ':state_json' => $stateJson,
        ]);
        $cut = $pdo->prepare('DELETE FROM dnd_save_snapshots WHERE campaign_id=:cid AND id NOT IN (SELECT id FROM (SELECT id FROM dnd_save_snapshots WHERE campaign_id=:cid2 ORDER BY id DESC LIMIT 30) keep_rows)');
        $cut->execute([':cid' => $campaignId, ':cid2' => $campaignId]);
        $pdo->commit();
        dnd_json(['ok' => true, 'campaign_id' => $campaignId, 'message' => 'DND tersimpan ke SQL.']);
    }

    dnd_json(['ok' => false, 'message' => 'Action DND tidak dikenal.'], 400);
} catch (Throwable $e) {
    if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
    error_log('[DND SQL] api failed: ' . $e->getMessage());
    dnd_json(['ok' => false, 'message' => 'SQL DND gagal memproses data. Data lokal tetap dipakai.'], 200);
}
