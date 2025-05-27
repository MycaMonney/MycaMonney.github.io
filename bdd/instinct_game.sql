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

-- Total drop_rate = 100
INSERT INTO instincts (instinct_name, drop_rate, image_url) VALUES
-- Communes (drop_rate = 5.09375)
('Aidan', 5.09375, 'img/Aidan.png'),
('Asterion', 5.09375, 'img/asterion.png'),
('Flamino', 5.09375, 'img/Flamino.png'),
('Floratop', 5.09375, 'img/Floraptor.png'),
('Myca', 5.09375, 'img/Myca.png'),
('Nepturtle', 5.09375, 'img/Nepturtle.png'),
('Sylvois', 5.09375, 'img/Sylvowis.png'),
('Tim', 5.09375, 'img/Tim.png'),
('Torshield', 5.09375, 'img/Torshield.png'),
('Turtisplash', 5.09375, 'img/Turtisplash.png'),
('Tylihibou', 5.09375, 'img/Tylhibou.png'),
('volcaragon', 5.09375, 'img/volcaragon.png'),
('lizea', 5.09375, 'img/lizea.png'),
('angelina', 5.09375, 'img/angelina.png'),
('alyssa', 5.09375, 'img/alyssa.png'),
('lucien', 5.09375, 'img/lucien.png'),
('reuben', 5.09375, 'img/reuben.png'),

-- Ex (drop_rate = 3.0)
('FloraptorEx', 3.0, 'img/FloraptorEx.png'),
('volcaragonEx', 3.0, 'img/volcaragonEx.png'),

-- Fullart (drop_rate = 1.5)
('AidanFullart', 1.5, 'img/AidanFullart.png'),
('MycaFullart', 1.5, 'img/MycaFullart.png'),
('TimFullart', 1.5, 'img/TimFullart.png'),
('lizeaFullart', 1.5, 'img/lizeaFullart.png'),
('angelinaFullart', 1.5, 'img/angelinaFullart.png'),
('alyssaFullart', 1.5, 'img/alyssaFullart.png'),
('lucienFullart', 1.5, 'img/lucienFullart.png'),
('reubenFullart', 1.5, 'img/reubenFullart.png'),

-- Ultra rare
('MistralusFullart', 0.5, 'img/MistralusFullart.png');