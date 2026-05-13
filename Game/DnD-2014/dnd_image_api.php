<?php
if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

function dnd_image_config(): array
{
    $config = [];
    $configFile = __DIR__ . '/dnd_ai_config.php';
    if (is_file($configFile)) {
        if (!defined('DND_INTERNAL_CONFIG')) {
            define('DND_INTERNAL_CONFIG', true);
        }
        $loaded = require $configFile;
        if (is_array($loaded)) {
            $config = $loaded;
        }
    }
    return $config;
}

function dnd_json_error(int $status, string $message, array $extra = []): void
{
    http_response_code($status);
    echo json_encode(array_merge(['ok' => false, 'error' => $message], $extra), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function dnd_safe_excerpt($value, int $limit = 900): string
{
    $text = is_string($value) ? $value : json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $text = (string)$text;
    if (function_exists('mb_substr')) {
        return mb_substr($text, 0, $limit, 'UTF-8');
    }
    return substr($text, 0, $limit);
}

function dnd_http_json_post(string $endpoint, string $apiKey, string $payload): array
{
    $body = false;
    $status = 0;
    $err = '';

    if (function_exists('curl_init')) {
        $ch = curl_init($endpoint);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
                'x-goog-api-key: ' . $apiKey,
            ],
            CURLOPT_POSTFIELDS => $payload,
            CURLOPT_TIMEOUT => 120,
        ]);

        $body = curl_exec($ch);
        $status = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $err = curl_error($ch);
        curl_close($ch);
    } else {
        $context = stream_context_create([
            'http' => [
                'method' => 'POST',
                'header' => "Content-Type: application/json\r\nx-goog-api-key: " . $apiKey . "\r\n",
                'content' => $payload,
                'timeout' => 120,
                'ignore_errors' => true,
            ],
        ]);
        $body = @file_get_contents($endpoint, false, $context);
        $headers = $http_response_header ?? [];
        foreach ($headers as $headerLine) {
            if (preg_match('/^HTTP\/\S+\s+(\d+)/', $headerLine, $m)) {
                $status = (int)$m[1];
                break;
            }
        }
        if ($body === false) {
            $err = 'Server tidak bisa membuka koneksi HTTP ke Gemini API.';
        }
    }

    return [$status, $body, $err];
}

function dnd_extract_image_payload(array $json): array
{
    $candidates = $json['candidates'] ?? [];
    foreach ($candidates as $candidate) {
        $parts = $candidate['content']['parts'] ?? [];
        foreach ($parts as $part) {
            if (!empty($part['inlineData']['data'])) {
                return [
                    'image' => (string)$part['inlineData']['data'],
                    'mime' => (string)($part['inlineData']['mimeType'] ?? 'image/png'),
                    'note' => (string)($part['text'] ?? ''),
                ];
            }
            if (!empty($part['inline_data']['data'])) {
                return [
                    'image' => (string)$part['inline_data']['data'],
                    'mime' => (string)($part['inline_data']['mime_type'] ?? 'image/png'),
                    'note' => (string)($part['text'] ?? ''),
                ];
            }
        }
        foreach ($parts as $part) {
            if (!empty($part['text'])) {
                return [
                    'image' => '',
                    'mime' => 'image/png',
                    'note' => (string)$part['text'],
                ];
            }
        }
    }
    return ['image' => '', 'mime' => 'image/png', 'note' => ''];
}

function dnd_build_generation_config(string $model, string $aspectRatio): array
{
    $imageConfig = ['aspectRatio' => $aspectRatio];
    if (stripos($model, 'pro') !== false || stripos($model, 'imagen') !== false) {
        $imageConfig['imageSize'] = '2K';
    }

    return [
        'responseModalities' => ['TEXT', 'IMAGE'],
        'imageConfig' => $imageConfig,
    ];
}

function dnd_enhance_battlemap_prompt(string $prompt, string $aspectRatio): string
{
    $qualityLock = implode("
", [
        'BATTLEMAP QUALITY LOCK:',
        '- Generate one top-down orthographic tabletop battle map image, not a poster and not a city satellite view.',
        '- Use large readable zones: buildings, roads, bridges, rooms, doors, cover objects, and chokepoints must be clear at token scale.',
        '- Do not create many tiny unreadable houses, micro props, crowded icons, text labels, title, watermark, UI, or character tokens.',
        '- Use a subtle square grid integrated into the artwork; keep movement lanes open and landmark areas obvious.',
        '- If the layout becomes too dense, zoom in and simplify it before output.',
        '- Preferred aspect ratio: ' . $aspectRatio . '.',
    ]);

    return trim($prompt . "

" . $qualityLock);
}

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        dnd_json_error(405, 'Method not allowed');
    }

    $raw = file_get_contents('php://input');
    $input = json_decode($raw ?: '{}', true);
    if (!is_array($input)) {
        $input = [];
    }

    $prompt = trim((string)($input['prompt'] ?? ''));
    if ($prompt === '') {
        dnd_json_error(422, 'Prompt map kosong.');
    }

    $allowedRatios = ['1:1', '2:3', '3:2', '3:4', '4:3', '4:5', '5:4', '9:16', '16:9'];
    $aspectRatio = trim((string)($input['aspectRatio'] ?? '3:4'));
    if (!in_array($aspectRatio, $allowedRatios, true)) {
        $aspectRatio = '3:4';
    }

    $prompt = dnd_enhance_battlemap_prompt($prompt, $aspectRatio);
    if (function_exists('mb_substr')) {
        $prompt = mb_substr($prompt, 0, 3200, 'UTF-8');
    } else {
        $prompt = substr($prompt, 0, 3200);
    }

    $config = dnd_image_config();
    $googleKey = getenv('GEMINI_API_KEY')
        ?: getenv('GOOGLE_API_KEY')
        ?: getenv('GOOGLE_GEMINI_API_KEY')
        ?: (string)($config['google_api_key'] ?? '');

    if ($googleKey === '') {
        dnd_json_error(501, 'Google/Gemini API key belum dipasang di server.', ['prompt' => $prompt]);
    }

    $requestedModel = trim((string)($input['model'] ?? ''));
    $configuredModel = trim((string)($config['google_image_model'] ?? 'gemini-2.5-flash-image'));
    $fallbackModels = array_values(array_unique(array_filter([
        $requestedModel,
        $configuredModel,
        'gemini-2.5-flash-image',
        'gemini-3-pro-image-preview',
        'gemini-2.0-flash-preview-image-generation',
    ])));

    $attempts = [];
    foreach ($fallbackModels as $model) {
        $payload = json_encode([
            'contents' => [[
                'parts' => [[
                    'text' => $prompt,
                ]],
            ]],
            'generationConfig' => dnd_build_generation_config($model, $aspectRatio),
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        if ($payload === false) {
            dnd_json_error(500, 'Gagal membuat payload image API.');
        }

        $endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/' . rawurlencode($model) . ':generateContent';
        [$status, $body, $err] = dnd_http_json_post($endpoint, $googleKey, $payload);

        if ($body === false) {
            $attempts[] = [
                'model' => $model,
                'status' => $status,
                'detail' => $err ?: 'Tidak ada respons body dari server model.',
            ];
            continue;
        }

        $json = json_decode((string)$body, true);
        if ($status >= 400 || !is_array($json)) {
            $attempts[] = [
                'model' => $model,
                'status' => $status,
                'detail' => $err ?: dnd_safe_excerpt($body),
            ];
            continue;
        }

        $parsed = dnd_extract_image_payload($json);
        if (!empty($parsed['image'])) {
            echo json_encode([
                'ok' => true,
                'image' => 'data:' . $parsed['mime'] . ';base64,' . $parsed['image'],
                'model' => $model,
                'note' => $parsed['note'],
                'aspectRatio' => $aspectRatio,
            ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            exit;
        }

        $attempts[] = [
            'model' => $model,
            'status' => $status,
            'detail' => dnd_safe_excerpt($parsed['note'] ?: $json),
        ];
    }

    dnd_json_error(502, 'Generate gambar map gagal.', ['attempts' => $attempts]);
} catch (Throwable $e) {
    dnd_json_error(500, $e->getMessage());
}
