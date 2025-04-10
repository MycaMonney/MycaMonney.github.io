<?php
// Activer les erreurs PHP pour le débogage
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Connexion à la base de données
$host = 'localhost';
$dbname = 'instinct_game';
$username = 'myca';
$password = 'Mycadomi2';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    die("Erreur de connexion à la base de données : " . $e->getMessage());
}

// Vérification que les données du formulaire sont envoyées
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Récupérer les données du formulaire
    $pseudo = trim($_POST['username']);
    $password = $_POST['password'];

    // Vérifier que tous les champs sont remplis
    if (!empty($pseudo) && !empty($password)) {
        // Récupérer l'utilisateur correspondant au pseudo
        $query = $pdo->prepare("SELECT * FROM users WHERE pseudo = :pseudo");
        $query->execute([':pseudo' => $pseudo]);
        $user = $query->fetch();

        // Vérifier si l'utilisateur existe
        if ($user) {
            // Vérifier le mot de passe
            if (password_verify($password, $user['password'])) {
                echo "Connexion réussie. Bienvenue, " . htmlspecialchars($user['pseudo']) . "!";
            } else {
                echo "Mot de passe incorrect.";
            }
        } else {
            echo "Aucun utilisateur trouvé avec ce pseudo.";
        }
    } else {
        echo "Veuillez remplir tous les champs.";
    }
} else {
    echo "Formulaire non soumis.";
}
?>
