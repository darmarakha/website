<?php
header('Content-Type: application/javascript; charset=utf-8');
$parts = glob(__DIR__ . '/data/dnd-data-part-*.js');
natsort($parts);
foreach ($parts as $part) {
    readfile($part);
    echo "\n";
}
