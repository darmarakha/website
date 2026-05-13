<?php
header('Content-Type: application/javascript; charset=utf-8');
echo "/* GemuYokai DnD app bundle: skill proficiency render fix v30 */\n";
$parts = glob(__DIR__ . '/js/dnd-app-part-*.js');
natsort($parts);
foreach ($parts as $part) {
    readfile($part);
    echo "\n";
}
