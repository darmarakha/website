<?php
session_start();
if (empty($_SESSION['user_name'])) {
    header('Location: ../../auth.php');
    die();
}
require __DIR__ . '/views/listening.view.php';
