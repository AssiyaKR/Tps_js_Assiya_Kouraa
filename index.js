const readline = require("node:readline/promises");
const { stdin: input, stdout: output } = require("node:process");

const API_BASE = "https://pokeapi.co/api/v2";
const START_HP = 300;
const MOVE_COUNT = 5;

const rl = readline.createInterface({ input, output });

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatName(value) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

async function getJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

async function buildMoves(moveEntries) {
  const shuffled = [...moveEntries].sort(() => Math.random() - 0.5);
  const selected = [];

  for (const entry of shuffled) {
    if (selected.length === MOVE_COUNT) break;

    try {
      const move = await getJson(entry.move.url);

      const isUsable =
        typeof move.power === "number" &&
        typeof move.accuracy === "number" &&
        typeof move.pp === "number" &&
        move.damage_class?.name !== "status";

      if (!isUsable) continue;

      // On veut 5 moves avec des puissances différentes
      if (selected.some((m) => m.power === move.power)) continue;

      selected.push({
        name: move.name,
        power: move.power,
        accuracy: move.accuracy,
        maxPP: move.pp,
        ppLeft: move.pp,
      });
    } catch {
      // On ignore les moves problématiques
    }
  }

  if (selected.length < MOVE_COUNT) {
    throw new Error("Pas assez de moves offensifs avec des puissances différentes.");
  }

  return selected;
}

async function fetchPokemon(identifier) {
  const data = await getJson(`${API_BASE}/pokemon/${identifier}`);
  const moves = await buildMoves(data.moves);

  return {
    name: data.name,
    hp: START_HP,
    moves,
  };
}

async function askPlayerPokemon() {
  while (true) {
    const answer = await rl.question(
      "Choisis ton Pokémon (ex: pikachu, charizard, bulbasaur) : "
    );

    const name = answer.trim().toLowerCase();
    if (!name) {
      console.log("Entre un nom valide.");
      continue;
    }

    try {
      return await fetchPokemon(name);
    } catch {
      console.log(`Impossible de charger "${name}". Réessaie.`);
    }
  }
}

async function getRandomBotPokemon(excludedName) {
  while (true) {
    const id = randomInt(1, 151);

    try {
      const pokemon = await fetchPokemon(id);
      if (pokemon.name !== excludedName) {
        return pokemon;
      }
    } catch {
      // on retente
    }
  }
}

function printStatus(player, bot) {
  console.log("\n==============================");
  console.log(`${formatName(player.name)} : ${player.hp} HP`);
  console.log(`${formatName(bot.name)} : ${bot.hp} HP`);
  console.log("==============================\n");
}

async function askPlayerMove(player) {
  console.log("Tes moves :");
  player.moves.forEach((move, index) => {
    console.log(
      `${index + 1}. ${formatName(move.name)} | power: ${move.power} | accuracy: ${move.accuracy}% | pp: ${move.ppLeft}/${move.maxPP}`
    );
  });

  while (true) {
    const answer = await rl.question("Choisis un move (1-5) : ");
    const choice = Number(answer);

    if (Number.isInteger(choice) && choice >= 1 && choice <= player.moves.length) {
      return player.moves[choice - 1];
    }

    console.log("Choix invalide. Réessaie.");
  }
}

function chooseRandomMove(pokemon) {
  const index = Math.floor(Math.random() * pokemon.moves.length);
  return pokemon.moves[index];
}

function canAttack(move, enemyMove) {
  if (move.ppLeft <= 0) return false;

  // Règle appliquée littéralement depuis le slide :
  // si le PP du move est inférieur à celui de l'adversaire,
  // l'attaque ne part pas.
  return move.ppLeft >= enemyMove.ppLeft;
}

function attemptAttack(attacker, defender, move, enemyMove) {
  if (move.ppLeft <= 0) {
    console.log(
      `${formatName(attacker.name)} ne peut pas utiliser ${formatName(move.name)} : PP épuisés.`
    );
    return;
  }

  if (!canAttack(move, enemyMove)) {
    console.log(
      `${formatName(attacker.name)} ne peut pas lancer ${formatName(move.name)} car son PP (${move.ppLeft}) est inférieur au PP adverse (${enemyMove.ppLeft}).`
    );
    return;
  }

  move.ppLeft -= 1;

  const hitRoll = Math.random() * 100;

  if (hitRoll > move.accuracy) {
    console.log(
      `${formatName(attacker.name)} utilise ${formatName(move.name)}, mais l'attaque rate.`
    );
    return;
  }

  const damage = move.power;
  defender.hp = Math.max(0, defender.hp - damage);

  console.log(
    `${formatName(attacker.name)} utilise ${formatName(move.name)} et inflige ${damage} dégâts à ${formatName(defender.name)}.`
  );
}

async function battle(player, bot) {
  console.log(`\nTon Pokémon : ${formatName(player.name)}`);
  console.log(`Pokémon du bot : ${formatName(bot.name)}\n`);

  let round = 1;

  while (player.hp > 0 && bot.hp > 0) {
    console.log(`===== Tour ${round} =====`);
    printStatus(player, bot);

    const playerMove = await askPlayerMove(player);
    const botMove = chooseRandomMove(bot);

    console.log(`Le bot a choisi ${formatName(botMove.name)}.`);

    attemptAttack(player, bot, playerMove, botMove);

    if (bot.hp <= 0) break;

    attemptAttack(bot, player, botMove, playerMove);

    round += 1;
  }

  printStatus(player, bot);

  if (player.hp > 0) {
    console.log(`Bravo, ${formatName(player.name)} gagne !`);
  } else {
    console.log(`Le bot gagne avec ${formatName(bot.name)}.`);
  }
}

async function main() {
  try {
    console.log("=== Mini jeu Pokémon ===");
    console.log("HP de départ : 300 pour chaque joueur.\n");

    const player = await askPlayerPokemon();
    const bot = await getRandomBotPokemon(player.name);

    await battle(player, bot);
  } catch (error) {
    console.error("Erreur :", error.message);
  } finally {
    rl.close();
  }
}

main();