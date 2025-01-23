-- Création de la base de données
CREATE DATABASE pokemon_game;

-- Utilisation de la base de données
USE pokemon_game;

-- Table des utilisateurs
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY, -- Identifiant unique de l'utilisateur
    pseudo VARCHAR(50) NOT NULL,      -- Pseudo de l'utilisateur
    email VARCHAR(100) NOT NULL,     -- Email de l'utilisateur
    password VARCHAR(255) NOT NULL, -- Mot de passe de l'utilisateur
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Date de création du compte
);

-- Table des Pokémon possédés par les utilisateurs
CREATE TABLE user_pokemons (
    id INT AUTO_INCREMENT PRIMARY KEY, -- Identifiant unique de la ligne
    user_id INT NOT NULL,              -- Identifiant de l'utilisateur
    pokemon_name VARCHAR(50) NOT NULL, -- Nom du Pokémon
    is_shiny BOOLEAN NOT NULL,         -- Si le Pokémon est shiny ou non
    strength INT NOT NULL CHECK (strength BETWEEN 10 AND 1000), -- Force du Pokémon (10-1000)
    captured_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Date et heure de capture du Pokémon
    FOREIGN KEY (user_id) REFERENCES users(id) -- Clé étrangère vers la table users
);

-- Exemple d'ajout d'un utilisateur
INSERT INTO users (pseudo, email, password) 
VALUES ('AshKetchum', 'ash@pokemon.com', 'pikachu123');

-- Exemple d'ajout de Pokémon pour un utilisateur
INSERT INTO user_pokemons (user_id, pokemon_name, is_shiny, strength, captured_at) 
VALUES (1, 'Pikachu', FALSE, 300, '2025-01-01 10:00:00'),
       (1, 'Charizard', TRUE, 900, '2025-01-02 15:30:00');