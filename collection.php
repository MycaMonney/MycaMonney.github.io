<?php
session_start();
if (!isset($_SESSION["user_id"])) {
    header("Location: login.html");
    exit;
}

$pseudo = htmlspecialchars($_SESSION["pseudo"]);
$user_id = $_SESSION["user_id"];

$host = 'localhost';
$db = 'instinct_game';
$user = 'myca';
$pass = 'Mycadomi2';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass);
} catch (PDOException $e) {
    die("Erreur de connexion : " . $e->getMessage());
}

// Liste ordonnée des cartes (noms d'images)
$orderedCards = [
    "Tylhibou.png",
    "Floraptor.png",
    "Sylvowis.png",
    "Flamino.png",
    "asterion.png",
    "volcaragon.png",
    "Turtisplash.png",
    "Nepturtle.png",
    "Torshield.png",
    "Aidan.png",
    "Tim.png",
    "Myca.png",
    "AidanFullart.png",
    "TimFullart.png",
    "MycaFullart.png",
    "MistralusFullart.png"
];

// Récupération des cartes possédées par l'utilisateur
$stmt = $pdo->prepare("SELECT instinct_name, quantity, image_url FROM user_instincts WHERE user_id = ?");
$stmt->execute([$user_id]);
$cards = $stmt->fetchAll(PDO::FETCH_ASSOC);

$owned = [];
foreach ($cards as $card) {
    $imageFile = basename($card['image_url']); // ← corrige le bug ici
    $owned[$imageFile] = $card['quantity'];
}

// Calcul du nombre total de cartes possédées
$totalOwned = count($owned);
$totalAvailable = count($orderedCards);
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Ma Collection</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            text-align: center;
        }
        #user-info {
            position: absolute;
            top: 10px;
            left: 10px;
            font-weight: bold;
        }
        .card-grid {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            margin-top: 60px;
        }
        .card {
            margin: 10px;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 8px;
            background-color: #f9f9f9;
            width: 220px;
        }
        .card img {
            width: 200px;
            height: 200px;
            object-fit: contain;
        }
        .card h3 {
            margin: 10px 0 5px 0;
        }
        a.button {
            display: inline-block;
            margin: 20px auto;
            padding: 10px 20px;
            background-color: #3a86ff;
            color: white;
            text-decoration: none;
            border-radius: 6px;
        }
        .counter {
            margin-top: 10px;
            font-weight: bold;
            font-size: 18px;
        }
    </style>
</head>
<body>
    <div id="user-info">👤 Connecté : <?= $pseudo ?></div>
    <h1>Ma Collection</h1>

    <div class="counter">
        Tu possèdes <?= $totalOwned ?> carte<?= $totalOwned > 1 ? 's' : '' ?> sur <?= $totalAvailable ?> disponibles.
    </div>

    <div class="card-grid">
        <?php foreach ($orderedCards as $cardImg): 
            $hasCard = isset($owned[$cardImg]);
            $imgPath = $hasCard ? "img/" . $cardImg : "img/unknown.png";
            $cardName = $hasCard ? pathinfo($cardImg, PATHINFO_FILENAME) : "???";
            $quantity = $hasCard ? $owned[$cardImg] : 0;
        ?>
            <div class="card">
                <img src="<?= $imgPath ?>" alt="<?= $cardName ?>">
                <p>Quantité : <?= $quantity ?></p>
            </div>
        <?php endforeach; ?>
    </div>

    <a href="booster.php" class="button">← Retour au booster</a>
</body>
</html>
