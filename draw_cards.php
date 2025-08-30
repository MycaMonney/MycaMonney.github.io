<?php
session_start();
header('Content-Type: application/json');
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Vérification de session
if (!isset($_SESSION['user_id'])) {
    http_response_code(403);
    echo json_encode(['error' => 'Non authentifié']);
    exit;
}

// Connexion à la base de données
try {
    $pdo = new PDO('mysql:host=localhost;dbname=instinct_game;charset=utf8', 'myca', 'Mycadomi2');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur connexion BDD : ' . $e->getMessage()]);
    exit;
}

// Récupération des cartes avec leur probabilité
try {
    $stmt = $pdo->query("SELECT instinct_name, drop_rate, image_url FROM instincts ORDER BY id ASC");
    $cartes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Construction de la distribution cumulative
    $distribution = [];
    $cumul = 0.0;
    foreach ($cartes as $carte) {
        $imageName = basename($carte['image_url']);
        $distribution[] = [
            'name' => $carte['instinct_name'],
            'drop_rate' => $carte['drop_rate'],
            'min' => $cumul,
            'max' => $cumul + $carte['drop_rate'],
            'image' => $imageName
        ];
        $cumul += $carte['drop_rate'];
    }

    // Tirage sans doublons
    $tirages = [];
    $déjàTirées = [];

    while (count($tirages) < 5) {
        $rand = round(mt_rand(0, 200) / 2, 1); // 0 à 100 arrondi à 0.5

        foreach ($distribution as $entry) {
            if ($rand >= $entry['min'] && $rand <= $entry['max']) {
                if (!in_array($entry['name'], $déjàTirées)) {
                    $tirages[] = $entry;
                    $déjàTirées[] = $entry['name'];
                }
                break;
            }
        }

        // Sécurité pour éviter une boucle infinie
        if (count($déjàTirées) >= count($distribution)) {
            break;
        }
    }

    // Tri du booster : du plus commun au plus rare
    usort($tirages, function ($a, $b) {
        return $b['drop_rate'] <=> $a['drop_rate'];
    });


    echo json_encode($tirages);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur lors du tirage : ' . $e->getMessage()]);
}