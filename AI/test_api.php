<?php
$_SERVER['REQUEST_METHOD'] = 'POST';
$input = json_encode(['action' => 'public_chat', 'message' => 'halo']);
file_put_contents('php://memory', $input); // Mock input
$_POST = [];
// Run api.php
ob_start();
require 'api.php';
$out = ob_get_clean();
echo "OUTPUT:\n$out\n";
