<?php
// Configuration de la base de données
$host = 'localhost';
$dbname = 'pokemon_game';
$username = 'myca';
$password = 'Mycadomi2';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    
    echo "Connexion réussie à la base de données.";
} catch (PDOException $e) {
    // Gestion des erreurs
    die("Erreur de connexion à la base de données : " . $e->getMessage());
}
