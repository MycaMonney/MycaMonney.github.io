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
-- Communes (18 × 4.52778)
('Aidan', 4.52778, 'img/Aidan.png'),
('Asterion', 4.52778, 'img/asterion.png'),
('Flamino', 4.52778, 'img/Flamino.png'),
('Floratop', 4.52778, 'img/Floraptor.png'),
('Myca', 4.52778, 'img/Myca.png'),
('Nepturtle', 4.52778, 'img/Nepturtle.png'),
('Sylvois', 4.52778, 'img/Sylvowis.png'),
('Tim', 4.52778, 'img/Tim.png'),
('Torshield', 4.52778, 'img/Torshield.png'),
('Turtisplash', 4.52778, 'img/Turtisplash.png'),
('Tylihibou', 4.52778, 'img/Tylhibou.png'),
('volcaragon', 4.52778, 'img/volcaragon.png'),
('lizea', 4.52778, 'img/lizea.png'),
('angelina', 4.52778, 'img/angelina.png'),
('alyssa', 4.52778, 'img/alyssa.png'),
('lucien', 4.52778, 'img/lucien.png'),
('reuben', 4.52778, 'img/reuben.png'),

-- Ex (2 × 3.0)
('FloraptorEx', 3.0, 'img/floraptorEx.png'),
('volcaragonEx', 3.0, 'img/volcaragonEx.png'),

-- Fullart (8 × 1.5)
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