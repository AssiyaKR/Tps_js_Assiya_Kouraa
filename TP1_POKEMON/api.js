// Import de la bibliothèque axios pour faire des requêtes HTTP (API)
const axios = require("axios");

// ---------------------------------------------------
// Fonction : fetchPokemon
// Rôle : récupérer les informations d’un Pokémon via son nom
// ---------------------------------------------------
async function fetchPokemon(name) {
  try {
    // Appel à l’API PokeAPI avec le nom du Pokémon
    const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${name}`);
    const data = res.data;

    // On récupère seulement les 10 premiers mouvements
    const moveList = data.moves.slice(0, 10);

    // Tableau pour stocker les moves valides
    const moves = [];

    // Parcours des moves
    for (let m of moveList) {

      // Appel de la fonction fetchMove pour récupérer les détails du move
      const move = await fetchMove(m.move.url);

      // Si le move est valide (power existe), on l'ajoute
      if (move) moves.push(move);

      // On limite à 5 moves maximum
      if (moves.length === 5) break;
    }

    // On retourne un objet avec le nom et les moves
    return { name: data.name, moves };

  } catch (error) {
    // Gestion d'erreur si le Pokémon n'existe pas
    console.log(`Pokémon "${name}" introuvable ! Vérifiez l'orthographe.`);
    console.log(`Exemples : pikachu, bulbasaur, charmander, mewtwo`);

    // Arrêt du programme
    process.exit(1);
  }
}

// ---------------------------------------------------
// Fonction : fetchMove
// Rôle : récupérer les détails d’un mouvement (attaque)
// ---------------------------------------------------
async function fetchMove(url) {

  // Requête API vers l'URL du move
  const res = await axios.get(url);
  const d = res.data;

  // On ignore les moves sans puissance (ex: moves de statut)
  if (!d.power) return null;

  // On retourne un objet avec les infos utiles
  return {
    name: d.name,           // nom du move
    power: d.power,         // puissance
    accuracy: d.accuracy || 100, // précision (100 par défaut si null)
    pp: d.pp,               // nombre total d'utilisations
    currentPp: d.pp,        // PP actuel (initialisé au max)
  };
}

// Export des fonctions pour les utiliser dans index.js
module.exports = { fetchPokemon, fetchMove };