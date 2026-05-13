<?php
$apiPath = __DIR__ . '/api.php';
$lines = file($apiPath);

$header = array_slice($lines, 0, 68);
$router = array_slice($lines, 3872); // From line 3873 to the end (index 3872)

$functions = array_slice($lines, 68, 3872 - 68); // From index 68 to 3871

$files = [
    'api_core.php' => "<?php\n// CORE UTILITIES & SETTINGS\n",
    'api_brain.php' => "<?php\n// BRAIN, MEMORY & STORAGE LOGIC\n",
    'api_agent.php' => "<?php\n// MULTI-AGENT DISCUSSION & REASONING\n",
    'api_website.php' => "<?php\n// WEBSITE SCAN, DIAGNOSIS & STAGED EDITS\n"
];

$fileKeys = array_keys($files);
$currentFileIdx = 0;
$totalLines = count($functions);
$targetLinesPerFile = ceil($totalLines / 4);

$currentFileLines = 0;

foreach ($functions as $line) {
    if ($currentFileLines >= $targetLinesPerFile && preg_match('/^function [a-zA-Z0-9_]+\(/', $line)) {
        if ($currentFileIdx < 3) {
            $currentFileIdx++;
            $currentFileLines = 0;
        }
    }
    
    $files[$fileKeys[$currentFileIdx]] .= $line;
    $currentFileLines++;
}

foreach ($files as $name => $content) {
    file_put_contents(__DIR__ . '/' . $name, $content);
}

$newApi = implode("", $header);
$newApi .= "\n// --- MODULAR INCLUDES ---\n";
foreach ($fileKeys as $name) {
    $newApi .= "require_once __DIR__ . '/$name';\n";
}
$newApi .= "\n";
$newApi .= implode("", $router);

file_put_contents($apiPath, $newApi);

echo "api.php successfully split into 4 files!\n";
?>
