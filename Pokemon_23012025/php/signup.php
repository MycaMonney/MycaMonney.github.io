<?php
require 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'];
    $password = password_hash($_POST['password'], PASSWORD_BCRYPT); // Hachage du mot de passe
    $email = $_POST['email'];

    try {
        // Requête pour insérer un nouvel utilisateur
        $stmt = $pdo->prepare("INSERT INTO users (pseudo, password, email) VALUES (:username, :password, :email)");
        $stmt->execute([
            'username' => $username,
            'password' => $password,
            'email' => $email
        ]);
        header("Location: index.html"); // Redirection vers la page de connexion
        exit();
    } catch (PDOException $e) {
        echo "Erreur : " . $e->getMessage();
    }
}
?>
