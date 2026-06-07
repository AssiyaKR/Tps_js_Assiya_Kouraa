// Import de la bibliothèque chalk pour afficher du texte en couleur dans le terminal
const chalk = require("chalk");

// ---------------------------------------------------
// Fonction : showHp
// Rôle : afficher la barre de vie d’un Pokémon avec une couleur dynamique
// ---------------------------------------------------
function showHp(name, hp) {

  // Choix de la couleur en fonction des HP
  // Vert = HP élevé, Jaune = moyen, Rouge = faible
  const color = hp > 150 
    ? chalk.green 
    : hp > 75 
    ? chalk.yellow 
    : chalk.red;

  // Affichage du nom + HP (minimum 0 pour éviter valeurs négatives)
  console.log(color(`${name} : ${Math.max(0, hp)} / 300 HP`));
}

// ---------------------------------------------------
// Fonction : showMoves
// Rôle : afficher la liste des attaques disponibles
// ---------------------------------------------------
function showMoves(moves) {

  // Titre stylé en cyan
  console.log(chalk.cyan("\n🎮 Choisissez votre attaque :"));

  // Parcours des attaques avec index
  moves.forEach((m, i) => {

    // Affichage de chaque move avec ses caractéristiques
    console.log(
      `  ${i + 1}. ${m.name} | 💥 Power: ${m.power} | 🎯 Accuracy: ${m.accuracy}% | PP: ${m.currentPp}`
    );
  });
}

// Export des fonctions pour les utiliser dans d'autres fichiers (ex: index.js)
module.exports = { showHp, showMoves };