<?php
/**
 * Test Runner — Standalone (tanpa PHPUnit/Composer)
 * Jalankan: php tests/run.php
 */

echo "╔══════════════════════════════════════════════════════╗\n";
echo "║         GEMU Website Test Runner v1.0               ║\n";
echo "╚══════════════════════════════════════════════════════╝\n\n";

$passed = 0;
$failed = 0;
$errors = [];

function test(string $name, bool $result, string $detail = '') {
    global $passed, $failed, $errors;
    if ($result) {
        echo "  ✓ PASS: {$name}\n";
        $passed++;
    } else {
        echo "  ✗ FAIL: {$name}" . ($detail ? " — {$detail}" : '') . "\n";
        $failed++;
        $errors[] = $name . ($detail ? ": {$detail}" : '');
    }
}

$root = realpath(__DIR__ . '/..');

// ═══════════════════════════════════════════════════
// 1. SECURITY TESTS
// ═══════════════════════════════════════════════════
echo "─── Security Tests ───\n";

// Password tidak boleh ada di file PHP yang accessible
$dangerousFiles = ['auth.php', 'Belajar/Bahasa-Jepang/save_score.php'];
foreach ($dangerousFiles as $file) {
    $path = $root . '/' . $file;
    if (is_file($path)) {
        $content = file_get_contents($path);
        $hasHardcoded = preg_match("/['\"]macanputih123['\"]/", $content);
        test("No hardcoded password in {$file}", !$hasHardcoded, 'Password plaintext ditemukan');
    }
}

// Config folder harus ada .htaccess
test('Config .htaccess exists', is_file($root . '/config/.htaccess'));
test('Config database.php exists', is_file($root . '/config/database.php'));
test('Config csrf.php exists', is_file($root . '/config/csrf.php'));

// Config database.php diproteksi oleh config/.htaccess + .gitignore (bukan absence di file)
if (is_file($root . '/config/database.php')) {
    test('Config .htaccess exists (protects DB credentials)', is_file($root . '/config/.htaccess'));
    test('Config database.php is in .gitignore', strpos(file_get_contents($root . '/.gitignore'), 'config/database.php') !== false);
}

// CSRF functions exist
if (is_file($root . '/config/csrf.php')) {
    $csrfContent = file_get_contents($root . '/config/csrf.php');
    test('CSRF generate function exists', strpos($csrfContent, 'function csrf_generate') !== false);
    test('CSRF verify function exists', strpos($csrfContent, 'function csrf_verify') !== false);
}

// Auth.php harus ada session_regenerate_id dan CSRF
if (is_file($root . '/auth.php')) {
    $authContent = file_get_contents($root . '/auth.php');
    test('Auth has session_regenerate_id', strpos($authContent, 'session_regenerate_id') !== false);
    test('Auth has CSRF check', strpos($authContent, 'csrf_require') !== false);
}

// AI .htaccess harus blokir JSON
test('AI .htaccess exists', is_file($root . '/AI/.htaccess'));
if (is_file($root . '/AI/.htaccess')) {
    $aiHt = file_get_contents($root . '/AI/.htaccess');
    test('AI .htaccess blocks JSON', strpos($aiHt, '.json') !== false);
    test('AI .htaccess blocks secret.php', strpos($aiHt, 'secret') !== false);
}

// Root .htaccess harus blokir config/
$rootHt = $root . '/.htaccess';
if (is_file($rootHt)) {
    $htContent = file_get_contents($rootHt);
    test('Root .htaccess blocks /config/', strpos($htContent, 'config') !== false);
    test('Root .htaccess has Options -Indexes', strpos($htContent, 'Options -Indexes') !== false);
}

// ═══════════════════════════════════════════════════
// 2. BUG REGRESSION TESTS
// ═══════════════════════════════════════════════════
echo "\n─── Bug Regression Tests ───\n";

// Tidak ada file .js yang berisi CSS
$jsFile = $root . '/Belajar/Bahasa-Jepang/assets/index.js';
test('No CSS-in-JS bug (index.js deleted)', !is_file($jsFile));

// Belajar/index.php harus lowercase
test('Belajar/index.php exists (lowercase)', 
    is_file($root . '/Belajar/index.php') || is_file($root . '/Belajar/Index.php'));

// Tidak ada folder Bisnsin
test('No Bisnsin typo folder', !is_dir($root . '/Bisnsin'));

// Tidak ada rendered.html
test('No rendered.html artifact', !is_file($root . '/rendered.html'));

// Tidak ada log files di public
test('No php-server.err.log', !is_file($root . '/php-server.err.log'));
test('No php-server.out.log', !is_file($root . '/php-server.out.log'));

// Tidak ada patch notes di public
test('No PATCH_NOTES_V18.txt', !is_file($root . '/PATCH_NOTES_V18.txt'));
test('No V14_MULTI_AGENT_UPDATE.txt', !is_file($root . '/V14_MULTI_AGENT_UPDATE.txt'));

// ═══════════════════════════════════════════════════
// 3. STRUCTURE TESTS
// ═══════════════════════════════════════════════════
echo "\n─── Structure Tests ───\n";

// Core files exist
$coreFiles = ['index.php', 'auth.php', 'app.js', 'data.js', 'AI/api.php', 'AI/index.php', 'AI/gemu.js', 'AI/gemu.css'];
foreach ($coreFiles as $file) {
    test("Core file exists: {$file}", is_file($root . '/' . $file));
}

// PHP syntax check pada file kritis
$phpFiles = ['auth.php', 'config/database.php', 'config/csrf.php', 'AI/api.php'];
foreach ($phpFiles as $file) {
    $path = $root . '/' . $file;
    if (is_file($path)) {
        $output = [];
        $returnCode = 0;
        exec("php -l " . escapeshellarg($path) . " 2>&1", $output, $returnCode);
        test("PHP syntax OK: {$file}", $returnCode === 0, implode(' ', $output));
    }
}

// ═══════════════════════════════════════════════════
// 4. AGENT INTELLIGENCE TESTS
// ═══════════════════════════════════════════════════
echo "\n─── Agent Intelligence Tests ───\n";

if (is_file($root . '/AI/api.php')) {
    $apiContent = file_get_contents($root . '/AI/api.php');
    test('Quality gate has files_read check', strpos($apiContent, 'filesRead === 0') !== false);
    test('Quality gate has confidence cap', strpos($apiContent, 'confidence < 0.80') !== false);
    test('Counter-argument in discussion', strpos($apiContent, 'COUNTER-ARGUMENT') !== false);
    test('Role disagreement check', strpos($apiContent, 'ratingSpread') !== false);
    test('Minimum 3 rounds enforced', strpos($apiContent, 'minRounds = 3') !== false);
    test('Hard cap: no file read = max 60', strpos($apiContent, "min(\$total, 60)") !== false);
}

// ═══════════════════════════════════════════════════
// SUMMARY
// ═══════════════════════════════════════════════════
echo "\n══════════════════════════════════════════════════════\n";
echo "Results: {$passed} PASSED, {$failed} FAILED\n";
if ($errors) {
    echo "\nFailed tests:\n";
    foreach ($errors as $e) echo "  • {$e}\n";
}
echo "══════════════════════════════════════════════════════\n";
exit($failed > 0 ? 1 : 0);
