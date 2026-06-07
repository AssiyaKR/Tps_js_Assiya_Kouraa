

//  // bot = l'objet Pokémon du bot, avec son tableau de moves
function botChooseMove(bot) {

  // Étape 1 : créer un tableau des moves disponibles (PP > 0)
  // .map() transforme chaque move en objet {move, index}
  //   → on garde l'index pour savoir quel move choisir
  const available = bot.moves
    .map((m, i) => ({ move: m, index: i }))
  // .filter() garde seulement les moves qui ont encore des PP
    .filter(({ move }) => move.currentPp > 0);

  // Sécurité : si tous les PP sont épuisés, on retourne 0 par défaut
  if (available.length === 0) return 0;

  // Étape 2 : choisir un index aléatoire dans la liste des moves disponibles
  // Math.floor() arrondit vers le bas pour avoir un entier
  // Math.random() * available.length → nombre entre 0 et available.length
  const random = Math.floor(Math.random() * available.length);
  // On retourne l'index du move dans le tableau original
  return available[random].index;
}
module.exports = { botChooseMove };












