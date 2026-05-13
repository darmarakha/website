<?php
/**
 * Konfigurasi AI server-side untuk DnD 2014.
 * Jangan pindahkan key ini ke JavaScript/client.
 */
if (!defined('DND_INTERNAL_CONFIG')) {
    http_response_code(403);
    exit('Forbidden');
}

return [
    'google_api_key' => 'AIzaSyDA2pJdiqnLIzEQTWbBUUBrs3MCRCQJGzE',
    'google_image_model' => 'gemini-2.5-flash-image',
];
