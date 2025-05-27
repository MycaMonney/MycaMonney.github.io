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

    $stmt = $pdo->prepare("SELECT * FROM users WHERE pseudo = ?");
    $stmt->execute([$pseudo]);
    $user = $stmt->fetch();

    if ($user && $user['password'] === $password) {
        $_SESSION["user_id"] = $user["id"];
        $_SESSION["pseudo"] = $user["pseudo"];
        header("Location:booster.php"); // Redirige vers booster
        exit;
    } else {
        echo "Identifiants incorrects.";
    }
}
?>
