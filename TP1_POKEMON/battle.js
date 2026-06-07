// attacker et defender = { name, hp, moves[] }
// moveIndex = le move choisi par le joueur ou le bot
 // attacker = celui qui attaque (player ou bot)
  // defender = celui qui reçoit l'attaque
  // moveIndex = index du move choisi (0 à 4)
// On récupère le move choisi depuis le tableau moves[] du combattant.
function attack(attacker, defender, moveIndex) {
  const move = attacker.moves[moveIndex];

  // ❌ Règle PP : si le PP du move est inférieur
  // au PP du move le plus fort de l'ennemi → echec
  const enemyMaxPp = Math.max(...defender.moves.map(m => m.currentPp));
  if (move.currentPp < enemyMaxPp) {
    console.log(`❌ ${attacker.name} ne peut pas utiliser ${move.name} (PP trop faible !)`);
    return;
  }

  //Règle Précision : on lance un dé entre 0 et 100
  // Si le dé dépasse la précision du move → on rate
  // Ex: accuracy=80, roll=85 → 85 > 80 → raté !
  const roll = Math.random() * 100;
  if (roll > move.accuracy) {
    console.log(`💨 ${attacker.name} a raté ${move.name} !`);
    move.currentPp--;
    return;
  }2

  //L'attaque réussit
  defender.hp -= move.power;
  move.currentPp--;
  console.log(`⚔️  ${attacker.name} utilise ${move.name} → ${move.power} dégâts !`);
  console.log(`💢 ${defender.name} : ${Math.max(0, defender.hp)} HP restants`);
}

module.exports = { attack };















 
