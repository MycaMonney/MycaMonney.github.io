<?php
session_start();
if (!isset($_SESSION["user_id"])) {
    header("Location: php/login.php");
    exit;
}
$pseudo = htmlspecialchars($_SESSION["pseudo"]);
?>
<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booster Pokémon</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(to bottom, #e0f7fa, #fff);
            text-align: center;
            background: linear-gradient(to bottom, #e0f7fa, #fff);
            background-repeat: no-repeat;
            background-size: cover;
            background-attachment: fixed;

            color: #333;
        }

        #user-info {
            position: absolute;
            top: 15px;
            left: 15px;
            font-weight: bold;
            color: #fff;
            background-color: rgba(0, 0, 0, 0.5);
            padding: 8px 14px;
            border-radius: 8px;
        }

        h1 {
            margin-top: 50px;
            font-size: 2.8em;
            color: #ffffff;
            text-shadow: 0 3px 6px rgba(0, 0, 0, 0.7);
        }

        #card-container {
            margin: 40px auto;
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            gap: 20px;
            max-width: 90%;
            padding: 20px;
            border-radius: 12px;
            background-color: rgba(255, 255, 255, 0.05);
        }

        img {
            width: 250px;
            height: 350px;
            object-fit: contain;
            border-radius: 12px;
            background-color: white;
            box-shadow: 0 6px 18px rgba(0, 0, 0, 0.3);
            transition: transform 0.25s ease;
        }

        img:hover {
            transform: scale(1.05);
        }

        button {
            padding: 12px 28px;
            font-size: 16px;
            margin: 12px;
            border: none;
            border-radius: 8px;
            background-color: #f4a261;
            color: white;
            font-weight: bold;
            cursor: pointer;
            transition: background-color 0.3s ease, transform 0.2s ease;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
        }

        button:hover {
            background-color: #e76f51;
            transform: translateY(-2px);
        }

        #view-collection-btn {
            background-color: #3a86ff;
            color: white;
        }

        #view-collection-btn:hover {
            background-color: #2b66c7;
        }

        @keyframes slideUp {
            0% {
                opacity: 0;
                transform: translateY(40px);
            }

            100% {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .card-animation-slide {
            animation: slideUp 0.5s ease-out forwards;
        }
    </style>
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.3.2"></script>
</head>

<body>
    <div id="user-info">👤 Connecté en tant que : <?= $pseudo ?></div>

    <h1>Ouvre ton booster Pokémon !</h1>
    <div id="card-container">
        <img id="current-card" src="img/Booster.png" alt="Booster">
    </div>

    <button id="open-booster">Ouvrir</button>
    <button id="next-card" style="display: none;">Suivant</button>
    <a href="collection.php">
        <button type="button" id="view-collection-btn">Voir ma collection</button>
    </a>

    <script>
        const images = [
            "asterion.png", "Flamino.png", "Floraptor.png", "MistralusFullart.png", "Nepturtle.png",
            "Sylvowis.png", "Torshield.png", "Turtisplash.png", "Tylhibou.png", "Tim.png",
            "TimFullart.png", "Aidan.png", "AidanFullart.png", "Myca.png", "MycaFullart.png"
        ];

        let drawnCards = [];
        let normalCards = [];
        let fullartCards = [];
        let currentIndex = 0;
        const maxDraws = 5;

        const cardContainer = document.getElementById("card-container");
        const openBoosterBtn = document.getElementById("open-booster");
        const nextCardBtn = document.getElementById("next-card");
        const collectionBtn = document.getElementById("view-collection-btn");

        openBoosterBtn.addEventListener("click", function () {
            drawnCards = [];
            normalCards = [];
            fullartCards = [];
            currentIndex = 0;
            cardContainer.innerHTML = "";
            drawCards();
            openBoosterBtn.style.display = "none";
            nextCardBtn.style.display = "inline-block";
            collectionBtn.style.display = "none"; // cacher le bouton collection
            displayCurrentCard();
        });

        nextCardBtn.addEventListener("click", function () {
            currentIndex++;
            if (currentIndex < drawnCards.length) {
                displayCurrentCard();
            } else {
                showRecap();
                saveCardsToDB(); // enregistrement des cartes
                nextCardBtn.innerText = "Retour";
                nextCardBtn.addEventListener("click", restartBooster, { once: true });
            }
        });

        async function drawCards() {
            try {
                const res = await fetch("draw_cards.php");
                const result = await res.json();

                if (res.ok) {
                    drawnCards = result;
                    displayCurrentCard();
                } else {
                    alert("Erreur lors du tirage : " + result.error);
                }
            } catch (err) {
                console.error("Erreur AJAX : ", err);
                alert("Erreur réseau.");
            }
        }

        function displayCurrentCard() {
            cardContainer.innerHTML = "";

            const currentCard = drawnCards[currentIndex];
            if (!currentCard || !currentCard.image) {
                console.error("Carte invalide :", currentCard);
                return;
            }

            const imgElement = document.createElement("img");
            imgElement.src = "img/" + currentCard.image;
            imgElement.classList.add("card-animation-slide");
            cardContainer.appendChild(imgElement);


            if (currentCard.image.includes("Fullart")) {
                launchConfetti();
            }
        }


        function showRecap() {
            cardContainer.innerHTML = "<h2>Récapitulatif du Booster :</h2>";

            drawnCards.forEach(card => {
                if (!card || !card.image) {
                    console.error("Carte invalide :", card);
                    return;
                }

                const img = document.createElement("img");
                img.src = "img/" + card.image;
                img.classList.add("card-animation-slide");
                cardContainer.appendChild(img);

            });
        }

        function restartBooster() {
            // Réinitialiser le flag côté serveur
            fetch("reset_booster.php").then(() => {
                drawnCards = [];
                normalCards = [];
                fullartCards = [];
                currentIndex = 0;
                cardContainer.innerHTML = "<img id='current-card' src='img/Booster.png' alt='Booster'>";
                openBoosterBtn.style.display = "inline-block";
                nextCardBtn.style.display = "none";
                nextCardBtn.innerText = "Suivant";
                collectionBtn.style.display = "inline-block";
            });
        }

        function launchConfetti() {
            confetti({
                particleCount: 1000,
                spread: 1000,
                origin: { y: 0.2 }
            });
        }

        function saveCardsToDB() {
            fetch("save_cards.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cards: drawnCards }) // PAS seulement les noms
            })
                .then(res => res.text())
                .then(data => console.log("✅ Cartes enregistrées :", data))
                .catch(err => console.error("❌ Erreur AJAX :", err));
        }

    </script>
</body>

</html>