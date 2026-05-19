<?php
declare(strict_types=1);

require_once __DIR__ . '/../config.php';

header('Content-Type: application/json; charset=utf-8');

// Load token from env or private config
$token = getenv('GITHUB_TOKEN');
if (!$token) {
    $privateConfigPath = __DIR__ . '/../config/github_private.php';
    if (file_exists($privateConfigPath)) {
        require_once $privateConfigPath;
        if (defined('GITHUB_TOKEN')) {
            $token = GITHUB_TOKEN;
        }
    }
}

$username = 'darmarakha';

try {
    // If DB fails, we can just return mock data or fail gracefully
    // Instead of completely throwing, let's catch DB errors specifically
    $pdo = null;
    $cache = null;
    $cachedData = null;
    $cacheValid = false;

    try {
        $pdo = gemu_pdo();
        // Create table if not exists
        $pdo->exec("CREATE TABLE IF NOT EXISTS `github_contributions_cache` (
            `id` int(11) NOT NULL AUTO_INCREMENT,
            `username` varchar(255) NOT NULL,
            `data_json` longtext NOT NULL,
            `last_fetched` datetime NOT NULL,
            PRIMARY KEY (`id`),
            UNIQUE KEY `username` (`username`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

        // Check cache
        $stmt = $pdo->prepare("SELECT data_json, last_fetched FROM github_contributions_cache WHERE username = ?");
        $stmt->execute([$username]);
        $cache = $stmt->fetch();

        if ($cache) {
            $cachedData = json_decode($cache['data_json'], true);
            $lastFetched = strtotime($cache['last_fetched']);
            $now = time();
            // 12 hours = 43200 seconds
            if (($now - $lastFetched) < 43200) {
                $cacheValid = true;
            }
        }
    } catch (Exception $dbErr) {
        // If DB fails (like locally without MySQL), we just proceed without cache
    }

    if ($cacheValid && $cachedData) {
        echo json_encode($cachedData);
        die();
    }

    // Fetch from GitHub GraphQL
    if (!$token) {
        // Mock fallback for local testing if no token available
        $mockData = [
            'ok' => true,
            'username' => $username,
            'totalContributions' => 294,
            'from' => '2025-05-01',
            'to' => '2026-05-19',
            'weeks' => [
                [
                    'firstDay' => '2025-05-01',
                    'days' => [
                        ['date' => '2025-05-01', 'count' => 0, 'level' => 0],
                        ['date' => '2025-05-02', 'count' => 1, 'level' => 1],
                        ['date' => '2025-05-03', 'count' => 5, 'level' => 2],
                        ['date' => '2025-05-04', 'count' => 10, 'level' => 4],
                    ]
                ]
            ],
            'lastFetchedAt' => date('Y-m-d H:i:s'),
            'stale' => true
        ];
        echo json_encode($mockData);
        die();
    }

    $query = 'query($userName:String!) {
        user(login: $userName){
            contributionsCollection {
                contributionCalendar {
                    totalContributions
                    weeks {
                        contributionDays {
                            contributionCount
                            date
                        }
                    }
                }
            }
        }
    }';

    $variables = ['userName' => $username];
    $payload = json_encode(['query' => $query, 'variables' => $variables]);

    $ch = curl_init('https://api.github.com/graphql');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: bearer ' . $token,
        'User-Agent: gemu-portfolio-app'
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($httpCode !== 200 || !$response) {
        if ($cachedData) {
            $cachedData['stale'] = true;
            echo json_encode($cachedData);
            die();
        }
        throw new Exception("GitHub API request failed: HTTP $httpCode - $curlError");
    }

    $ghData = json_decode($response, true);
    if (isset($ghData['errors'])) {
        if ($cachedData) {
            $cachedData['stale'] = true;
            echo json_encode($cachedData);
            die();
        }
        throw new Exception("GitHub GraphQL error: " . json_encode($ghData['errors']));
    }

    $calendar = $ghData['data']['user']['contributionsCollection']['contributionCalendar'] ?? null;
    if (!$calendar) {
        throw new Exception("Failed to parse GitHub contribution data.");
    }

    $weeksData = [];
    foreach ($calendar['weeks'] as $week) {
        $daysData = [];
        $firstDay = '';
        foreach ($week['contributionDays'] as $idx => $day) {
            if ($idx === 0) $firstDay = $day['date'];

            $count = $day['contributionCount'];
            $level = 0;
            if ($count > 0) $level = 1;
            if ($count > 3) $level = 2;
            if ($count > 6) $level = 3;
            if ($count > 9) $level = 4;

            $daysData[] = [
                'date' => $day['date'],
                'count' => $count,
                'level' => $level,
                'color' => ''
            ];
        }
        $weeksData[] = [
            'firstDay' => $firstDay,
            'days' => $daysData
        ];
    }

    $from = '';
    $to = '';
    if (count($weeksData) > 0) {
        $firstWeekDays = $weeksData[0]['days'];
        if (count($firstWeekDays) > 0) {
            $from = $firstWeekDays[0]['date'];
        }
        $lastWeekDays = $weeksData[count($weeksData)-1]['days'];
        if (count($lastWeekDays) > 0) {
            $to = $lastWeekDays[count($lastWeekDays)-1]['date'];
        }
    }

    $finalData = [
        'ok' => true,
        'username' => $username,
        'totalContributions' => $calendar['totalContributions'],
        'from' => $from,
        'to' => $to,
        'weeks' => $weeksData,
        'lastFetchedAt' => date('Y-m-d H:i:s')
    ];

    $finalJson = json_encode($finalData);

    // Save to cache
    if ($pdo) {
        try {
            if ($cache) {
                $stmt = $pdo->prepare("UPDATE github_contributions_cache SET data_json = ?, last_fetched = NOW() WHERE username = ?");
                $stmt->execute([$finalJson, $username]);
            } else {
                $stmt = $pdo->prepare("INSERT INTO github_contributions_cache (username, data_json, last_fetched) VALUES (?, ?, NOW())");
                $stmt->execute([$username, $finalJson]);
            }
        } catch (Exception $e) {}
    }

    echo $finalJson;

} catch (Exception $e) {
    echo json_encode([
        'ok' => false,
        'error' => $e->getMessage()
    ]);
}
