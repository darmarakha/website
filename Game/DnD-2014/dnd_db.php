<?php
// Database khusus DND. Credential tetap memakai config website utama lewat ../../config/database.php.
// File ini hanya memastikan endpoint DND memilih database httpgemu_dnd, bukan tabel dnd_* yang mungkin pernah ter-import ke httpgemu_website.
if (!defined('DND_DB_NAME')) {
    define('DND_DB_NAME', 'httpgemu_dnd');
}
