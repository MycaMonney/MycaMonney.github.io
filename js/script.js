const apiURL = "https://tyradex.app/api/v1/pokemon"; // API des Pokémon
let map, userMarker
let pokemonMarkers = [];
let storedAppearances = {}; // Réinitialisé à un objet vide
let allPokemon = []; // Stocke tous les Pokémon récupérés
let activeMarker = null; // Stocke le marqueur actif

function generateAndPlacePokemons(centerLat, centerLon, radius) {
    // Supprimer les marqueurs existants
    pokemonMarkers.forEach(marker => map.removeLayer(marker));
    pokemonMarkers = []; // Réinitialise la liste des marqueurs

    // Générer 10 nouveaux Pokémon
    for (let i = 0; i < 10; i++) {
        const randomPosition = generateRandomPosition(centerLat, centerLon, radius);

        const randomPokemon = allPokemon[Math.floor(Math.random() * allPokemon.length)];

        // Vérifiez que le Pokémon a une apparition enregistrée
        if (!storedAppearances[randomPokemon.name?.fr]) {
            storedAppearances[randomPokemon.name?.fr] = [];
        }
        storedAppearances[randomPokemon.name?.fr].push(randomPosition);

        const marker = L.marker(randomPosition, {
            icon: createPokemonIcon(randomPokemon.sprites?.regular || 'img/default.png')
        }).addTo(map);

        marker.on('click', () => {
            showPokemonPopup(
                randomPokemon.sprites?.regular,
                randomPokemon.sprites?.shiny,
                randomPokemon,
                marker
            );
        });

        // Ajouter le marqueur à la liste
        pokemonMarkers.push(marker);
    }

    console.log("10 nouveaux Pokémon générés autour de la position.");
}
document.getElementById('refresh-pokemon').addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;

                // Générer 10 nouveaux Pokémon dans un rayon de 5 km autour de l'utilisateur
                generateAndPlacePokemons(lat, lon, 5);
            },
            error => {
                console.error("Impossible de récupérer la position de l'utilisateur :", error);

                // Si la géolocalisation échoue, utiliser une position par défaut
                const defaultLat = 0;
                const defaultLon = 0;
                generateAndPlacePokemons(defaultLat, defaultLon, 5);
            }
        );
    } else {
        console.warn("Géolocalisation non supportée.");
        const defaultLat = 0;
        const defaultLon = 0;
        generateAndPlacePokemons(defaultLat, defaultLon, 5);
    }
});
function initMap() {
    // Création de la carte
    map = L.map('map');
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Géolocalisation de l'utilisateur
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;

                // Centrer la carte sur l'utilisateur
                map.setView([lat, lon], 12);
                userMarker = L.marker([lat, lon]).addTo(map);
                userMarker.bindPopup("Vous êtes ici").openPopup();

                // Générer et afficher les Pokémon
                generateAndPlacePokemons(lat, lon, 5); // Rayon de 5 km
            },
            error => {
                console.warn("Impossible de récupérer la position utilisateur :", error);

                // Si la géolocalisation échoue, position par défaut
                const defaultLat = 0;
                const defaultLon = 0;
                map.setView([defaultLat, defaultLon], 2);

                // Générer les Pokémon autour de la position par défaut
                generateAndPlacePokemons(defaultLat, defaultLon, 5);
            }
        );
    } else {
        console.warn("Géolocalisation non supportée");
        const defaultLat = 0;
        const defaultLon = 0;
        map.setView([defaultLat, defaultLon], 2);

        // Générer les Pokémon autour de la position par défaut
        generateAndPlacePokemons(defaultLat, defaultLon, 5);
    }
}

document.getElementById('tab-list').addEventListener('click', () => showSection('list'));
document.getElementById('tab-map').addEventListener('click', () => {
    showSection('map');
    setTimeout(() => {
        if (!map) {
            initMap(); // Initialise la carte si elle n'existe pas encore
        } else {
            map.invalidateSize(); // Réinitialise la taille de la carte
        }
    }, 300);
});

document.getElementById('tab-pokemon-overview').addEventListener('click', () => {
    showSection('pokemon-overview');
    displayPokemonOverview(); // Met à jour l'affichage de la vue d'ensemble
});


function showSection(sectionId) {
    const sections = ['list', 'map', 'pokedex', 'pokedex-shiny', 'pokemon-overview'];
    sections.forEach(id => {
        const section = document.getElementById(id);
        if (section) {
            section.style.display = id === sectionId ? 'block' : 'none';
        }
    });

    // Réinitialise la taille de la carte si elle est affichée
    if (sectionId === 'map' && map) {
        setTimeout(() => map.invalidateSize(), 300);
    }
}


function generateRandomPosition(centerLat, centerLon, radius) {
    const radiusInDegrees = radius / 111; // Approximation de 111 km par degré de latitude
    const u = Math.random();
    const v = Math.random();
    const w = radiusInDegrees * Math.sqrt(u);
    const t = 2 * Math.PI * v;
    const deltaLat = w * Math.cos(t);
    const deltaLon = w * Math.sin(t) / Math.cos(centerLat * Math.PI / 180);
    return [centerLat + deltaLat, centerLon + deltaLon];
}

async function fetchPokemon() {
    console.log("fetchPokemon called");
    try {
        const response = await fetch(apiURL);
        const data = await response.json();
        console.log("API response received:", data); // Log des données récupérées

        // Filtrer pour exclure MissingNo
        allPokemon = data.filter(pokemon => pokemon.name?.fr !== "MissingNo.");

        // Initialiser une apparition par défaut pour chaque Pokémon
        allPokemon.forEach(pokemon => {
            if (!storedAppearances[pokemon.name?.fr]) {
                // Générer une position aléatoire autour de [0, 0] (par défaut)
                const defaultAppearance = generateRandomPosition(0, 0, 5); // Rayon de 10 km autour du centre
                storedAppearances[pokemon.name?.fr] = [defaultAppearance];
            }
        });
        // Passez les données initiales à la fonction de rendu
        displayPokemonList(allPokemon);
    } catch (error) {
        console.error("Erreur lors de la récupération des Pokémon :", error);
    }
}


// Fonction pour afficher la liste des Pokémon
function displayPokemonList(pokemonList) {
    const listContainer = document.getElementById('pokemon-list');
    listContainer.innerHTML =
        `<table class="table">
            <thead>
                <tr>
                    <th>Image</th>
                    <th>Nom (FR)</th>
                    <th>Types</th>
                </tr>
            </thead>
            <tbody>
                ${pokemonList.map(pokemon => `
                    <tr>
                        <td>
                            <img src="${pokemon.sprites?.regular || '#'}" 
                                 alt="${pokemon.name?.fr || 'Inconnu'}" 
                                 style="width: 50px; height: 50px;">
                        </td>
                        <td>${pokemon.name?.fr || 'Nom non disponible'}</td>
                        <td>
                            ${pokemon.types?.map(type => `
                                <img src="${type.image}" 
                                     alt="${type.name}" 
                                     title="${type.name}" 
                                     style="width: 30px; height: 30px; margin-right: 5px;">
                            `).join('') || 'Non défini'}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>`;
}
function displayPokemonOverview() {
    const overviewContainer = document.getElementById('pokemon-overview-list');
    overviewContainer.innerHTML = `
        <table class="table">
            <thead>
                <tr>
                    <th>Index</th>
                    <th>Image</th>
                    <th>Nom</th>
                </tr>
            </thead>
            <tbody>
                ${allPokemon.map((pokemon, index) => {
                    const isCaptured = pokedex.some(p => p.name === pokemon.name.fr); // Vérifie si capturé
                    const isSeen = storedAppearances[pokemon.name?.fr]?.some(ap => ap.seen); // Vérifie si vu

                    // Définir les valeurs par défaut
                    let displayName = '???';
                    let imageFilter = 'brightness(0)'; // Par défaut : image en noir
                    let imageUrl = pokemon.sprites?.regular || '/img/pokeball.png'; // Par défaut : image du Pokémon ou Pokéball

                    if (isSeen) {
                        imageFilter = 'brightness(1)'; // Image normale si vu
                    }

                    if (isCaptured) {
                        displayName = pokemon.name?.fr || '???'; // Afficher le nom si capturé
                    }

                    return `
                        <tr>
                            <td>${index + 1}</td>
                            <td>
                                <img src="${imageUrl}" 
                                     alt="${pokemon.name?.fr || '???'}" 
                                     style="width: 50px; height: 50px; filter: ${imageFilter};">
                            </td>
                            <td>${displayName}</td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}
function saveAppearancesToLocalStorage() {
    localStorage.setItem('storedAppearances', JSON.stringify(storedAppearances));
}

function loadAppearancesFromLocalStorage() {
    const storedData = localStorage.getItem('storedAppearances');
    if (storedData) {
        storedAppearances = JSON.parse(storedData);
    }
}
document.addEventListener('DOMContentLoaded', () => {
    loadAppearancesFromLocalStorage(); // Charger les apparitions
    updatePokedexDisplay(); // Met à jour l'affichage initial du Pokédex
});


let pokedex = JSON.parse(localStorage.getItem('pokedex')) || []; // Charge les données depuis le localStorage ou initialise un tableau vide
let pokedexShiny = JSON.parse(localStorage.getItem('pokedexShiny')) || [];

function savePokedexToLocalStorage() {
    localStorage.setItem('pokedex', JSON.stringify(pokedex)); // Sauvegarde le Pokédex normal
    localStorage.setItem('pokedexShiny', JSON.stringify(pokedexShiny)); // Sauvegarde le Pokédex shiny
}

function isShiny() {
    return Math.random() < 1 / 50; // 1/50 chance
}
function generatePokemonStrength() {
    return Math.floor(Math.random() * (1000 - 10 + 1)) + 10; // Force entre 10 et 1000
}
function calculateCaptureChance(strength) {
    const captureChance = 100 - Math.round(((strength - 10) / 990) * 98); // Calcul de la probabilité
    return Math.max(1, Math.min(99, captureChance)); // Assure que la probabilité est entre 1% et 99%
}
function closePopupAndRemoveMarker() {
    const popup = document.getElementById('pokemon-popup');

    // Ferme le popup
    popup.style.display = 'none';

    // Supprime le marqueur actif de la carte et met à jour les apparitions
    if (activeMarker && activeMarker.pokemonName) {
        removePokemonAppearance(activeMarker.pokemonName, activeMarker); // Supprime l'apparition
        map.removeLayer(activeMarker); // Supprime le marqueur de la carte
        activeMarker = null; // Réinitialise le marqueur actif
    }

    // Met à jour l'affichage de la liste des Pokémon
    displayPokemonList(allPokemon);
}

function updatePokedexDisplay() {
    const normalTableBody = document.querySelector("#captured-pokemon-table tbody");
    const shinyTableBody = document.querySelector("#captured-pokemon-shiny-table tbody");

    normalTableBody.innerHTML = ""; // Réinitialise le tableau des Pokémon normaux
    shinyTableBody.innerHTML = ""; // Réinitialise le tableau des Pokémon shiny

    function generateTableContent(pokemonList, tableBody, isShiny) {
        const groupedPokemon = {};

        // Regroupe les Pokémon par nom
        pokemonList.forEach(pokemon => {
            if (!groupedPokemon[pokemon.name]) {
                groupedPokemon[pokemon.name] = [];
            }
            groupedPokemon[pokemon.name].push(pokemon);
        });

        // Génère les lignes du tableau
        Object.entries(groupedPokemon).forEach(([name, pokemons], index) => {
            // Date de la dernière capture pour affichage principal
            const latestCaptureDate = pokemons[pokemons.length - 1]?.capturedAt || 'Non défini';

            const row = `
                <tr>
                    <td>
                        <button
                            class="btn btn-link"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#collapse-${name}-${index}"
                            aria-expanded="false"
                            aria-controls="collapse-${name}-${index}">
                            ${name}
                        </button>
                    </td>
                    <td>${pokemons.length} capturé(s)</td>
                    <td>${latestCaptureDate}</td>
                </tr>
                <tr class="collapse" id="collapse-${name}-${index}">
                    <td colspan="3">
                        <ul class="list-group">
                            ${pokemons
                    .map(pokemon => `
                                    <li class="list-group-item d-flex align-items-center">
                                        <img src="${isShiny ? pokemon.shinyImage : pokemon.regularImage}" 
                                             alt="${pokemon.name}" 
                                             style="width: 50px; height: 50px; margin-right: 10px;">
                                        <div>
                                            <span>Force : ${pokemon.strength}</span><br>
                                            <span>Date de capture : ${pokemon.capturedAt}</span>
                                        </div>
                                    </li>
                                `)
                    .join("")}
                        </ul>
                    </td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
    }

    generateTableContent(pokedex, normalTableBody, false); // Normaux
    generateTableContent(pokedexShiny, shinyTableBody, true); // Shiny
}

function attemptCapture(pokemon, strength, shiny) {
    const captureChance = calculateCaptureChance(strength); // Calcule la probabilité de capture
    const randomValue = Math.random() * 100; // Génère un nombre entre 0 et 100

    if (randomValue < captureChance) {
        const capturedPokemon = {
            name: pokemon.name.fr,
            strength,
            shiny,
            regularImage: pokemon.sprites?.regular || 'img/default.png', // Image normale
            shinyImage: pokemon.sprites?.shiny || 'img/default-shiny.png', // Image shiny
            capturedAt: new Date().toLocaleString() // Date et heure de capture
        };

        if (shiny) {
            pokedexShiny.push(capturedPokemon); // Ajoute au Pokédex Shiny
            alert(`Félicitations ! Vous avez capturé un Pokémon shiny : ${pokemon.name.fr} avec ${captureChance}% de chance.`);
        } else {
            pokedex.push(capturedPokemon); // Ajoute au Pokédex normal
            alert(`Félicitations ! Vous avez capturé ${pokemon.name.fr} avec ${captureChance}% de chance.`);
        }

        savePokedexToLocalStorage(); // Sauvegarde les changements dans le localStorage
        updatePokedexDisplay(); // Met à jour les deux tableaux
        saveAppearancesToLocalStorage(); // Sauvegarde l'état des apparitions
    } else {
        alert(`Le Pokémon s'est échappé... Vous aviez ${captureChance}% de chance.`);
    }

    closePopupAndRemoveMarker(); // Ferme le popup et supprime le Pokémon de la carte
}
document.addEventListener('DOMContentLoaded', () => {
    updatePokedexDisplay(); // Met à jour l'affichage initial du Pokédex
});

document.addEventListener("DOMContentLoaded", function () {
    const tabs = document.querySelectorAll(".nav-link"); // Sélectionner tous les onglets
    const sections = document.querySelectorAll("#content > div"); // Sélectionner toutes les sections

    tabs.forEach(tab => {
        tab.addEventListener("click", function (event) {
            event.preventDefault();

            // Retirer la classe "active" de tous les onglets
            tabs.forEach(t => t.classList.remove("active"));

            // Ajouter la classe "active" à l'onglet cliqué
            this.classList.add("active");

            // Masquer toutes les sections
            sections.forEach(section => section.style.display = "none");

            // Afficher la section liée à l'onglet cliqué
            const target = document.querySelector(this.getAttribute("href"));
            if (target) {
                target.style.display = "block";
            }
        });
    });
});


document.getElementById('close-popup').onclick = () => {
    closePopupAndRemovePokemon(); // Ferme le popup et supprime le Pokémon
};

function removePokemonAppearance(pokemonName, marker) {
    // Vérifie si des apparitions existent pour ce Pokémon
    if (storedAppearances[pokemonName]) {
        // Trouve l'indice de l'apparition correspondant à la position du marqueur
        const markerPosition = marker.getLatLng();
        storedAppearances[pokemonName] = storedAppearances[pokemonName].filter(
            appearance => appearance[0] !== markerPosition.lat || appearance[1] !== markerPosition.lng
        );
    }
}

function clearPokemonOverview() {
    if (confirm("Êtes-vous sûr de vouloir réinitialiser la vue d'ensemble des Pokémon ?")) {
        storedAppearances = {}; // Réinitialiser les apparitions
        localStorage.removeItem('storedAppearances'); // Supprimer les données du localStorage

        // Réinitialiser l'état des Pokémon dans l'overview
        allPokemon.forEach(pokemon => {
            if (pokemon.name?.fr) {
                const defaultAppearance = generateRandomPosition(0, 0, 5); // Position par défaut
                storedAppearances[pokemon.name.fr] = [{ seen: false }];
            }
        });

        displayPokemonOverview(); // Met à jour l'affichage
        alert("La vue d'ensemble des Pokémon a été réinitialisée, les noms sont masqués.");
    }
}


document.getElementById('clear-pokemon-overview').addEventListener('click', clearPokemonOverview);

function createPokemonIcon(imageUrl) {
    return L.icon({
        iconUrl: imageUrl, // Utilise directement l'URL de l'image depuis l'API
        iconSize: [60, 60], // Taille de l'image sur la carte
        iconAnchor: [30, 60], // Point d'ancrage (au centre en bas de l'image)
    });
}

function showPokemonPopup(imageUrl, shinyImageUrl, pokemon, marker) {
    activeMarker = marker; // Stocke le marqueur actif pour référence

    const popup = document.getElementById('pokemon-popup');
    const popupImage = document.getElementById('popup-image');
    const popupStrength = document.getElementById('popup-strength');
    const popupPokeball = document.getElementById('popup-pokeball');
    const popupCaptureChance = document.getElementById('popup-capture-chance');

        // Marquer comme vu si ce n'est pas déjà le cas
        if (!storedAppearances[pokemon.name?.fr]?.some(ap => ap.seen)) {
            if (!storedAppearances[pokemon.name?.fr]) {
                storedAppearances[pokemon.name?.fr] = [];
            }
            storedAppearances[pokemon.name?.fr].push({ seen: true }); // Enregistrer comme vu
        }

    // Vérifie si le Pokémon est shiny
    const shiny = isShiny();
    popupImage.src = shiny ? shinyImageUrl : imageUrl; // Utilise l'image shiny si shiny, sinon normale

    // Génère la force du Pokémon
    const strength = generatePokemonStrength();
    popupStrength.textContent = `Force : ${strength}`; // Met à jour la force dans le popup

    // Calcule et affiche la chance de capture
    const captureChance = calculateCaptureChance(strength);
    popupCaptureChance.textContent = `Chance de capture : ${captureChance}%`;

    // Affiche la Pokéball
    popupPokeball.src = 'img/pokeball.png';

    // Gestion de la capture
    popupPokeball.onclick = () => {
        const success = attemptCapture(pokemon, strength, shiny); // Tente la capture
        if (success) {
            if (shiny) {
                pokedexShiny.push(pokemon); // Ajoute au Pokédex Shiny
            } else {
                pokedex.push(pokemon); // Ajoute au Pokédex normal
            }
            updatePokedexDisplay(); // Met à jour l'affichage du Pokédex
        }

        // Dans tous les cas, le Pokémon disparaît
        if (activeMarker) {
            map.removeLayer(activeMarker); // Supprime le marqueur de la carte
            activeMarker = null; // Réinitialise le marqueur actif
        }
        popup.style.display = 'none'; // Masque le popup
    };

    // Gestion du bouton "Fermer"
    document.getElementById('close-popup').onclick = () => {
        if (activeMarker) {
            map.removeLayer(activeMarker); // Supprime le marqueur de la carte
            activeMarker = null; // Réinitialise le marqueur actif
        }
        popup.style.display = 'none'; // Masque le popup
    };

    // Affiche la popup
    popup.style.display = 'flex';
}



function viewPokemonOnMap(pokemonName) {
    // Trouver le Pokémon correspondant dans la liste
    const pokemon = allPokemon.find(p => p.name?.fr === pokemonName);
    if (!pokemon) {
        alert("Pokémon introuvable !");
        return;
    }

    // Vérifiez s'il y a des apparitions enregistrées pour ce Pokémon
    const appearances = storedAppearances[pokemonName];
    if (!appearances || appearances.length === 0) {
        alert("Aucune apparition pour ce Pokémon.");
        return;
    }

    // Centrer la carte sur la première apparition
    map.setView(appearances[0], 13);

    // Supprimez les anciens marqueurs de Pokémon
    pokemonMarkers.forEach(marker => map.removeLayer(marker));
    pokemonMarkers = [];

    // Ajouter les marqueurs pour chaque apparition
    appearances.forEach(coord => {
        const marker = L.marker(coord, {
            icon: createPokemonIcon(pokemon.sprites?.regular), // Utiliser l'image du Pokémon depuis l'API
        }).addTo(map);

        // Ajout de l'événement au clic sur le marqueur
        marker.on('click', () => {
            showPokemonPopup(
                pokemon.sprites?.regular, // Image normale
                pokemon.sprites?.shiny,  // Image shiny
                pokemon,                 // Données du Pokémon
                marker                   // Marqueur cliqué
            );
        });

        pokemonMarkers.push(marker); // Ajouter le marqueur à la liste
    });
}
function clearPokemonMarkers() {
    pokemonMarkers.forEach(marker => map.removeLayer(marker)); // Supprime chaque marqueur de la carte
    pokemonMarkers = []; // Réinitialise la liste des marqueurs
}
function clearPokedex() {
    if (confirm("Êtes-vous sûr de vouloir supprimer tous les Pokémon du Pokédex ?")) {
        pokedex = []; // Réinitialise le Pokédex
        localStorage.removeItem('pokedex'); // Supprime les données du localStorage
        updatePokedexDisplay(); // Met à jour l'affichage
        alert("Le Pokédex a été réinitialisé.");
    }
}

function clearPokedexShiny() {
    if (confirm("Êtes-vous sûr de vouloir supprimer tous les Pokémon du Pokédex Shiny ?")) {
        pokedexShiny = []; // Réinitialise le Pokédex Shiny
        localStorage.removeItem('pokedexShiny'); // Supprime les données du localStorage
        updatePokedexDisplay(); // Met à jour l'affichage
        alert("Le Pokédex Shiny a été réinitialisé.");
    }
}
document.getElementById('clear-pokedex').addEventListener('click', clearPokedex);
document.getElementById('clear-pokedex-shiny').addEventListener('click', clearPokedexShiny);

function showSection(sectionId) {
    const sections = ['list', 'map', 'pokedex', 'pokedex-shiny', 'pokemon-overview'];
    sections.forEach(id => {
        const section = document.getElementById(id);
        if (section) {
            section.style.display = id === sectionId ? 'block' : 'none';
        }
    });

    // Réinitialise la taille de la carte si elle est affichée
    if (sectionId === 'map' && map) {
        setTimeout(() => map.invalidateSize(), 300);
    }
}


document.getElementById('tab-pokedex').addEventListener('click', () => {
    showSection('pokedex');
    updatePokedexDisplay(); // Met à jour la liste du Pokédex
});
document.getElementById('tab-pokedex-shiny').addEventListener('click', () => {
    showSection('pokedex-shiny');
    updatePokedexDisplay(); // Met à jour la liste du Pokédex Shiny
});


// Fonction pour ajouter une apparition d'un Pokémon
function addPokemonAppearance(pokemonName) {
    if (!navigator.geolocation) {
        alert("La géolocalisation n'est pas supportée par votre appareil.");
        return;
    }

    // Trouver le Pokémon correspondant dans la liste
    const pokemon = allPokemon.find(p => p.name?.fr === pokemonName);
    if (!pokemon) {
        alert("Pokémon introuvable !");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            // Générer une position aléatoire dans un rayon de 10 km
            const appearance = generateRandomPosition(lat, lon, 10);

            // Initialiser la liste des apparitions pour le Pokémon si elle n'existe pas
            if (!storedAppearances[pokemonName]) {
                storedAppearances[pokemonName] = [];
            }

            // Ajouter la nouvelle apparition
            storedAppearances[pokemonName].push(appearance);

            // Ajouter le marqueur avec l'image du Pokémon
            const marker = L.marker(appearance, {
                icon: createPokemonIcon(pokemon.sprites?.regular || 'img/default.png') // Utilise l'image depuis l'API
            }).addTo(map);

            marker.bindPopup(`<strong>${pokemonName}</strong>`).openPopup(); // Popup pour le marqueur
            pokemonMarkers.push(marker); // Ajouter le marqueur à la liste

            // Met à jour la liste affichée
            displayPokemonList(allPokemon);

            alert(`Une apparition a été ajoutée pour ${pokemonName} !`);
        },
        error => {
            alert("Impossible de récupérer votre position.");
        }
    );
}


// Écouter les entrées dans la barre de recherche
document.getElementById('search-bar').addEventListener('input', (event) => {
    const searchTerm = event.target.value.toLowerCase();

    const filteredPokemon = allPokemon.filter(pokemon => {
        const nameMatches = pokemon.name?.fr?.toLowerCase().includes(searchTerm);
        const pokedexMatches = pokemon.pokedex_id?.toString().includes(searchTerm); // Vérifie si le numéro de Pokédex correspond
        const typesMatches = pokemon.types?.some(type => type.name.toLowerCase().includes(searchTerm));

        // Inclut le Pokémon si l'une des conditions est remplie
        return nameMatches || pokedexMatches || typesMatches;
    });

    displayPokemonList(filteredPokemon);
});


document.getElementById('tab-map').addEventListener('click', () => {
    document.getElementById('list').style.display = 'none';
    document.getElementById('map').style.display = 'block';
    setTimeout(() => {
        if (!map) {
            initMap();
        } else {
            map.invalidateSize();
        }
    }, 300);
});

// Initialisation au chargement
fetchPokemon();
