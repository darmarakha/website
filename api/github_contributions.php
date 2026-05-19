<?php
/**
 * API: Fetch GitHub Contributions (Heatmap)
 *
 * Fetches contribution data from GitHub GraphQL API, securely using a backend token.
 * Caches the response in the database to prevent rate limiting (12 hour expiration).
 */

require_once __DIR__ . '/../config.php';

// Try to load GitHub config
$github_config_path = __DIR__ . '/../config/github_private.php';
if (file_exists($github_config_path)) {
    require_once $github_config_path;
}

// Fallback config if not defined
if (!defined('GITHUB_USERNAME')) {
    define('GITHUB_USERNAME', 'darmarakha');
}
if (!defined('GITHUB_TOKEN')) {
    define('GITHUB_TOKEN', getenv('GITHUB_TOKEN') ?: ''); // Needs to be set in github_private.php
}

header('Content-Type: application/json');

function return_error($message) {
    echo json_encode(['ok' => false, 'error' => $message]);
    die();
}

// Ensure database table exists
function ensure_table_exists(PDO $pdo): bool {
    try {
        $pdo->query("SELECT 1 FROM github_contribution_cache LIMIT 1");
        return true;
    } catch (PDOException $e) {
        return false; // Table doesn't exist, requires manual creation via SQL script
    }
}

// Fetch from GitHub GraphQL API
function fetch_from_github($username, $token) {
    if (empty($token)) {
        return null;
    }

    $query = '
    query($userName:String!) {
      user(login: $userName){
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
                contributionLevel
              }
            }
          }
        }
      }
    }
    ';

    $variables = ['userName' => $username];
    $payload = json_encode(['query' => $query, 'variables' => $variables]);

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, 'https://api.github.com/graphql');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: bearer ' . $token,
        'Content-Type: application/json',
        'User-Agent: GemuYokai-Portfolio'
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode === 200 && $response) {
        return json_decode($response, true);
    }
    return null;
}

try {
    $pdo = gemu_pdo();
    $cache_ttl_seconds = 12 * 60 * 60; // 12 hours
    $now = time();

    // Check Cache
    if (ensure_table_exists($pdo)) {
        $stmt = $pdo->prepare("SELECT * FROM github_contribution_cache WHERE github_username = :username LIMIT 1");
        $stmt->execute(['username' => GITHUB_USERNAME]);
        $cachedRow = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($cachedRow) {
            $updatedAt = strtotime($cachedRow['updated_at']);
            if (($now - $updatedAt) < $cache_ttl_seconds) {
                // Return cached data
                $cacheData = json_decode($cachedRow['calendar_json'], true);
                if ($cacheData) {
                    echo json_encode(['ok' => true, 'source' => 'cache'] + $cacheData);
                    die();
                }
            }
        }
    }

    // Cache expired or missing, fetch fresh data
    if (empty(GITHUB_TOKEN)) {
        // Fallback for local testing without token
        throw new Exception("GitHub token not configured. Please set GITHUB_TOKEN.");
    }

    $ghData = fetch_from_github(GITHUB_USERNAME, GITHUB_TOKEN);

    if (!$ghData || !isset($ghData['data']['user']['contributionsCollection']['contributionCalendar'])) {
        throw new Exception("Failed to fetch data from GitHub API.");
    }

    $calendar = $ghData['data']['user']['contributionsCollection']['contributionCalendar'];

    // Transform data for frontend
    $formattedData = [
        'totalContributions' => $calendar['totalContributions'],
        'weeks' => []
    ];

    // Level mapping from GitHub API (NONE, FIRST_QUARTILE, SECOND_QUARTILE, THIRD_QUARTILE, FOURTH_QUARTILE) to 0-4
    $levelMap = [
        'NONE' => 0,
        'FIRST_QUARTILE' => 1,
        'SECOND_QUARTILE' => 2,
        'THIRD_QUARTILE' => 3,
        'FOURTH_QUARTILE' => 4
    ];

    foreach ($calendar['weeks'] as $week) {
        $weekData = ['days' => []];
        $firstDay = null;

        foreach ($week['contributionDays'] as $day) {
            if (!$firstDay) $firstDay = $day['date'];
            $weekData['days'][] = [
                'date' => $day['date'],
                'count' => $day['contributionCount'],
                'level' => isset($levelMap[$day['contributionLevel']]) ? $levelMap[$day['contributionLevel']] : 0
            ];
        }
        $weekData['firstDay'] = $firstDay;
        $formattedData['weeks'][] = $weekData;
    }

    // Save to Cache if table exists
    if (ensure_table_exists($pdo)) {
        $jsonToCache = json_encode($formattedData);
        if ($cachedRow) {
            $stmt = $pdo->prepare("UPDATE github_contribution_cache
                                   SET calendar_json = :calendar_json, updated_at = CURRENT_TIMESTAMP
                                   WHERE github_username = :username");
            $stmt->execute(['calendar_json' => $jsonToCache, 'username' => GITHUB_USERNAME]);
        } else {
            $stmt = $pdo->prepare("INSERT INTO github_contribution_cache
                                   (github_username, calendar_json)
                                   VALUES (:username, :calendar_json)");
            $stmt->execute(['username' => GITHUB_USERNAME, 'calendar_json' => $jsonToCache]);
        }
    }

    // Return fresh data
    echo json_encode(['ok' => true, 'source' => 'api'] + $formattedData);

} catch (Exception $e) {
    // If API fails, try to return stale cache if available
    if (isset($cachedRow) && $cachedRow) {
        $cacheData = json_decode($cachedRow['calendar_json'], true);
        if ($cacheData) {
            echo json_encode(['ok' => true, 'source' => 'stale_cache', 'error' => $e->getMessage()] + $cacheData);
            die();
        }
    }
    return_error($e->getMessage());
}
