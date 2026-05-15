<?php
// GEMU NVIDIA API bridge.
// Catatan penting: API key tidak boleh ditaruh di repository.
// Pakai environment variable NVIDIA_API_KEY atau file lokal AI/nvidia.local.php yang sudah masuk .gitignore.

function gemu_env_value(string $name): string {
    $value = getenv($name);
    if (is_string($value) && trim($value) !== '') return trim($value);
    if (isset($_ENV[$name]) && trim((string)$_ENV[$name]) !== '') return trim((string)$_ENV[$name]);
    if (isset($_SERVER[$name]) && trim((string)$_SERVER[$name]) !== '') return trim((string)$_SERVER[$name]);
    return '';
}

function gemu_secret_mask(string $value): string {
    $value = trim($value);
    if ($value === '') return '';
    $len = strlen($value);
    if ($len <= 12) return str_repeat('•', max(4, $len));
    return substr($value, 0, 6) . '••••••' . substr($value, -4);
}

function gemu_nvidia_config(): array {
    $key = defined('GEMU_NVIDIA_API_KEY') ? (string)GEMU_NVIDIA_API_KEY : gemu_env_value('NVIDIA_API_KEY');
    $model = defined('GEMU_NVIDIA_MODEL') ? (string)GEMU_NVIDIA_MODEL : gemu_env_value('GEMU_NVIDIA_MODEL');
    $base = defined('GEMU_NVIDIA_BASE_URL') ? (string)GEMU_NVIDIA_BASE_URL : gemu_env_value('GEMU_NVIDIA_BASE_URL');
    $endpoint = defined('GEMU_NVIDIA_ENDPOINT') ? (string)GEMU_NVIDIA_ENDPOINT : gemu_env_value('GEMU_NVIDIA_ENDPOINT');

    if ($model === '') $model = 'nvidia/llama-3.1-nemotron-ultra-253b-v1';
    if ($base === '') $base = 'https://integrate.api.nvidia.com/v1';
    $base = rtrim($base, '/');
    if ($endpoint === '') $endpoint = $base . '/chat/completions';

    return [
        'configured' => $key !== '',
        'key_masked' => gemu_secret_mask($key),
        'api_key' => $key,
        'base_url' => $base,
        'endpoint' => $endpoint,
        'model' => $model,
        'timeout' => (int)(defined('GEMU_NVIDIA_TIMEOUT') ? GEMU_NVIDIA_TIMEOUT : 35),
        'max_tokens' => (int)(defined('GEMU_NVIDIA_MAX_TOKENS') ? GEMU_NVIDIA_MAX_TOKENS : 900),
        'temperature' => (float)(defined('GEMU_NVIDIA_TEMPERATURE') ? GEMU_NVIDIA_TEMPERATURE : 0.35),
    ];
}

function gemu_nvidia_ready(): bool {
    $cfg = gemu_nvidia_config();
    return !empty($cfg['configured']) && function_exists('curl_init');
}

function gemu_nvidia_chat(array $messages, array $options = []): array {
    $cfg = gemu_nvidia_config();
    if (empty($cfg['configured'])) {
        return [
            'ok' => false,
            'provider' => 'nvidia',
            'message' => 'NVIDIA API belum aktif. Isi environment variable NVIDIA_API_KEY atau buat AI/nvidia.local.php di server.',
            'code' => 'missing_key',
            'config' => ['model'=>$cfg['model'], 'endpoint'=>$cfg['endpoint'], 'key_masked'=>'']
        ];
    }
    if (!function_exists('curl_init')) {
        return [
            'ok' => false,
            'provider' => 'nvidia',
            'message' => 'Ekstensi PHP cURL belum aktif di server, jadi GEMU belum bisa memanggil NVIDIA API.',
            'code' => 'curl_missing',
            'config' => ['model'=>$cfg['model'], 'endpoint'=>$cfg['endpoint'], 'key_masked'=>$cfg['key_masked']]
        ];
    }

    $payload = [
        'model' => (string)($options['model'] ?? $cfg['model']),
        'messages' => $messages,
        'temperature' => isset($options['temperature']) ? (float)$options['temperature'] : $cfg['temperature'],
        'max_tokens' => isset($options['max_tokens']) ? (int)$options['max_tokens'] : $cfg['max_tokens'],
        'stream' => false,
    ];

    $ch = curl_init((string)$cfg['endpoint']);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $cfg['api_key'],
            'Accept: application/json',
        ],
        CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE),
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_TIMEOUT => max(12, (int)$cfg['timeout']),
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2,
    ]);

    $raw = curl_exec($ch);
    $curlError = curl_error($ch);
    $httpCode = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($raw === false || $curlError !== '') {
        return [
            'ok' => false,
            'provider' => 'nvidia',
            'message' => 'Koneksi ke NVIDIA API gagal: ' . safe_text($curlError, 240),
            'code' => 'curl_error',
            'http_code' => $httpCode,
            'config' => ['model'=>$payload['model'], 'endpoint'=>$cfg['endpoint'], 'key_masked'=>$cfg['key_masked']]
        ];
    }

    $json = json_decode((string)$raw, true);
    if (!is_array($json)) {
        return [
            'ok' => false,
            'provider' => 'nvidia',
            'message' => 'Respons NVIDIA bukan JSON valid. HTTP ' . $httpCode . '.',
            'code' => 'bad_json',
            'http_code' => $httpCode,
            'raw_preview' => safe_text((string)$raw, 420),
            'config' => ['model'=>$payload['model'], 'endpoint'=>$cfg['endpoint'], 'key_masked'=>$cfg['key_masked']]
        ];
    }

    if ($httpCode < 200 || $httpCode >= 300) {
        $err = $json['error']['message'] ?? $json['message'] ?? 'HTTP ' . $httpCode;
        return [
            'ok' => false,
            'provider' => 'nvidia',
            'message' => 'NVIDIA API menolak request: ' . safe_text((string)$err, 420),
            'code' => 'http_error',
            'http_code' => $httpCode,
            'config' => ['model'=>$payload['model'], 'endpoint'=>$cfg['endpoint'], 'key_masked'=>$cfg['key_masked']]
        ];
    }

    $content = $json['choices'][0]['message']['content'] ?? '';
    if (is_array($content)) $content = json_encode($content, JSON_UNESCAPED_UNICODE);
    $content = trim((string)$content);

    return [
        'ok' => $content !== '',
        'provider' => 'nvidia',
        'message' => $content !== '' ? $content : 'NVIDIA API menjawab kosong.',
        'code' => $content !== '' ? 'ok' : 'empty_content',
        'http_code' => $httpCode,
        'usage' => $json['usage'] ?? null,
        'model' => $json['model'] ?? $payload['model'],
        'config' => ['model'=>$payload['model'], 'endpoint'=>$cfg['endpoint'], 'key_masked'=>$cfg['key_masked']]
    ];
}
?>