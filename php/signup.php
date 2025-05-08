<?php
// Connexion à la base de données
$host = 'localhost';
$dbname = 'pokemon_game';
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

    // Récupération des données du formulaire
    $pseudo = trim($_POST['username']);
    $email = trim($_POST['email']);
    $password = $_POST['password'];

    // Vérification si tous les champs sont remplis
    if (!empty($pseudo) && !empty($email) && !empty($password)) {

        // Vérification si l'email est déjà utilisé
        $query = $pdo->prepare("SELECT * FROM users WHERE email = ?");
        $query->execute([$email]);
        if ($query->rowCount() > 0) {
            die("Cet email est déjà utilisé.<br>");
        }

        // Hashage du mot de passe
        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

        // Insertion des données dans la base
        $sql = "INSERT INTO users (pseudo, email, password) VALUES (:pseudo, :email, :password)";
        $stmt = $pdo->prepare($sql);

        try {
            $stmt->execute([
                ':pseudo' => $pseudo,
                ':email' => $email,
                ':password' => $hashedPassword,
            ]);
            header("Location: index.html");
            exit();
        } catch (PDOException $e) {
            die("Erreur lors de la création du compte : " . $e->getMessage());
        }
    } else {
        echo "Veuillez remplir tous les champs.<br>";
    }
} else {
    echo "Formulaire non soumis.<br>"; // Message si aucune requête POST
}
//c'est ne
?>