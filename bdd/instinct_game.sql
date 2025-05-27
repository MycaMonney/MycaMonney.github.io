-- Création de la base
DROP DATABASE IF EXISTS instinct_game;
CREATE DATABASE instinct_game;
USE instinct_game;

-- Table des utilisateurs (connexion via pseudo + mot de passe)
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pseudo VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Données d'exemple utilisateurs
INSERT INTO users (pseudo, password) VALUES
('Myca', 'Super'),
('BakaNasa', 'Super');

-- Table des cartes liées à l'utilisateur
CREATE TABLE user_instincts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  instinct_name VARCHAR(50) NOT NULL,
  quantity INT NOT NULL DEFAULT 0,
  image_url VARCHAR(255) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Table des cartes disponibles dans le jeu
CREATE TABLE instincts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  instinct_name VARCHAR(50) NOT NULL,
  drop_rate FLOAT NOT NULL,
  image_url VARCHAR(255) NOT NULL
);

-- Répartition avec drop_rate total = 100
INSERT INTO instincts (instinct_name, drop_rate, image_url) VALUES
('Aidan', 6.0, 'img/Aidan.png'),
('AidanFullart', 1.5, 'img/AidanFullart.png'),
('Asterion', 6.0, 'img/asterion.png'),
('Flamino', 7.0, 'img/Flamino.png'),
('Floratop', 7.0, 'img/Floraptor.png'),
('MistralusFullart', 0.5, 'img/MistralusFullart.png'),
('Myca', 6.0, 'img/Myca.png'),
('MycaFullart', 1.5, 'img/MycaFullart.png'),
('Nepturtle', 6.0, 'img/Nepturtle.png'),
('Sylvois', 6.0, 'img/Sylvowis.png'),
('Tim', 6.0, 'img/Tim.png'),
('TimFullart', 1.5, 'img/TimFullart.png'),
('Torshield', 6.0, 'img/Torshield.png'),
('Turtisplash', 6.0, 'img/Turtisplash.png'),
('Tylihibou', 6.0, 'img/Tylhibou.png'),
('volcaragon', 6.0, 'img/volcaragon.png');