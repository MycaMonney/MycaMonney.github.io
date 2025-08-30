<?php
session_start();
header("Content-Type: text/plain");

// Sécurité session
if (!isset($_SESSION["user_id"])) {
    http_response_code(403);
    echo "Utilisateur non connecté.";
    exit;
}

$host = 'localhost';
$db = 'instinct_game';
$user = 'myca';
$pass = 'Mycadomi2';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo "Erreur DB : " . $e->getMessage();
    exit;
}

// Empêche traitement multiple dans la même session
if (!empty($_SESSION["booster_saved"])) {
    echo "🚫 Booster déjà enregistré dans cette session.";
    exit;
}

// Lecture et validation JSON
$data = json_decode(file_get_contents("php://input"), true);
if (!isset($data["cards"]) || !is_array($data["cards"])) {
    echo "Erreur : Aucune carte reçue.";
    exit;
}

$user_id = $_SESSION["user_id"];
$cards = $data["cards"];
$alreadyProcessed = [];

foreach ($cards as $card) {
    if (!isset($card["name"], $card["image"])) continue;

    $cardName = htmlspecialchars($card["name"]);
    $imagePath = "img/" . basename($card["image"]); // sécurise le chemin

    if (in_array($cardName, $alreadyProcessed)) continue;
    $alreadyProcessed[] = $cardName;

    // Vérifie si l'utilisateur a déjà la carte
    $stmt = $pdo->prepare("SELECT id FROM user_instincts WHERE user_id = ? AND instinct_name = ?");
    $stmt->execute([$user_id, $cardName]);
    $found = $stmt->fetch();

    if ($found) {
        $update = $pdo->prepare("UPDATE user_instincts SET quantity = quantity + 1 WHERE id = ?");
        $update->execute([$found["id"]]);
    } else {
        $insert = $pdo->prepare("INSERT INTO user_instincts (user_id, instinct_name, quantity, image_url) VALUES (?, ?, 1, ?)");
        $insert->execute([$user_id, $cardName, $imagePath]);
    }
}

// Marque le booster comme enregistré
$_SESSION["booster_saved"] = true;
echo "✅ Cartes enregistrées avec succès.";
