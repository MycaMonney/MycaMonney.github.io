<?php
session_start();
$host = 'localhost';
$db = 'instinct_game';
$user = 'myca';
$pass = 'Mycadomi2';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass);
} catch (PDOException $e) {
    die("Erreur de connexion : " . $e->getMessage());
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $pseudo = $_POST["username"];
    $password = $_POST["password"];

    // Vérifie si le pseudo existe déjà
    $check = $pdo->prepare("SELECT id FROM users WHERE pseudo = ?");
    $check->execute([$pseudo]);
    if ($check->fetch()) {
        echo "Ce pseudo est déjà utilisé.";
        exit;
    }

    // Insère le nouvel utilisateur
    $stmt = $pdo->prepare("INSERT INTO users (pseudo, password) VALUES (?, ?)");
    if ($stmt->execute([$pseudo, $password])) {
        header("Location: index.html"); 
        exit;
    } else {
        echo "Erreur lors de la création du compte.";
    }
}
?>
