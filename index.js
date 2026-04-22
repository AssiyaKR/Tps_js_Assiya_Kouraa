const readline = require("node:readline/promises");
const { stdin: input, stdout: output } = require("node:process");

const API_BASE = "https://pokeapi.co/api/v2";
const START_HP = 300;
const MOVE_COUNT = 5;

const rl = readline.createInterface({ input, output });

// Simple in-memory cache to avoid repeated API calls
const cache = new Map();

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatName(value = "") {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

// Fetch JSON with caching to reduce API requests
async function getJson(url) {
  if (cache.has(url)) return cache.get(url);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  cache.set(url, data);

  return data;
}

// Build a move set by filtering usable offensive moves
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

      // Avoid duplicate power values for variety
      if (selected.some((m) => m.power === move.power)) continue;

      selected.push({
        name: move.name,
        power: move.power,
        accuracy: move.accuracy,
        maxPP: move.pp,
        ppLeft: move.pp,
      });
    } catch {
      // Ignore invalid or failed move fetches
    }
  }

  if (selected.length < MOVE_COUNT) {
    throw new Error("Not enough valid offensive moves found.");
  }

  return selected;
}

// Fetch a Pokémon and attach its processed move set
async function fetchPokemon(identifier) {
  const data = await getJson(`${API_BASE}/pokemon/${identifier}`);
  const moves = await buildMoves(data.moves);

  return {
    name: data.name,
    hp: START_HP,
    moves,
  };
}

// Ask the player to choose a Pokémon with basic validation
async function askPlayerPokemon() {
  while (true) {
    const answer = await rl.question(
      "Choose your Pokémon (pikachu, charizard, etc): "
    );

    const name = answer.trim().toLowerCase();

    if (!name) {
      console.log("Please enter a valid name.");
      continue;
    }

    try {
      return await fetchPokemon(name);
    } catch {
      console.log(`Could not load "${name}". Try again.`);
    }
  }
}

// Damage calculation with small randomness factor
function calculateDamage(move) {
  const variance = 0.85 + Math.random() * 0.3;
  return Math.floor(move.power * variance);
}

// Select bot Pokémon randomly, avoiding the player's choice
async function getRandomBotPokemon(excludedName) {
  while (true) {
    const id = randomInt(1, 151);

    try {
      const pokemon = await fetchPokemon(id);

      if (pokemon.name !== excludedName) {
        return pokemon;
      }
    } catch {
      // Retry on failure
    }
  }
}

function printStatus(player, bot) {
  console.log("\n==============================");
  console.log(`${formatName(player.name)}: ${player.hp} HP`);
  console.log(`${formatName(bot.name)}: ${bot.hp} HP`);
  console.log("==============================\n");
}

// Ask player to pick a move
async function askPlayerMove(player) {
  console.log("Your moves:");

  player.moves.forEach((move, index) => {
    console.log(
      `${index + 1}. ${formatName(move.name)} | power: ${move.power} | accuracy: ${move.accuracy}% | pp: ${move.ppLeft}/${move.maxPP}`
    );
  });

  while (true) {
    const answer = await rl.question("Choose a move (1-5): ");
    const choice = Number(answer);

    if (
      Number.isInteger(choice) &&
      choice >= 1 &&
      choice <= player.moves.length
    ) {
      return player.moves[choice - 1];
    }

    console.log("Invalid choice, try again.");
  }
}

// Bot selects strongest available move
function chooseBestMove(pokemon) {
  const usable = pokemon.moves.filter((m) => m.ppLeft > 0);

  if (usable.length === 0) return null;

  return usable
    .map((m) => ({
      move: m,
      score: m.power * (m.accuracy / 100),
    }))
    .sort((a, b) => b.score - a.score)[0].move;
}

// Simple rule that blocks attack based on PP comparison (kept as-is from design)
function canAttack(move, enemyMove) {
  if (move.ppLeft <= 0) return false;
  return move.ppLeft >= enemyMove.ppLeft;
}

// Execute an attack attempt
function attemptAttack(attacker, defender, move, enemyMove) {
  if (move.ppLeft <= 0) return;

  if (!canAttack(move, enemyMove)) return;

  move.ppLeft -= 1;

  const hitRoll = Math.random() * 100;

  if (hitRoll > move.accuracy) {
    console.log(
      `${formatName(attacker.name)} used ${formatName(move.name)} but missed.`
    );
    return;
  }

  const damage = calculateDamage(move);
  defender.hp = Math.max(0, defender.hp - damage);

  console.log(
    `${formatName(attacker.name)} used ${formatName(
      move.name
    )} and dealt ${damage} damage.`
  );
}

// Main battle loop
async function battle(player, bot) {
  console.log(`\n${formatName(player.name)} vs ${formatName(bot.name)}\n`);

  let round = 1;

  while (player.hp > 0 && bot.hp > 0) {
    console.log(`Round ${round}`);
    printStatus(player, bot);

    const playerMove = await askPlayerMove(player);
    const botMove = chooseBestMove(bot);

    console.log(`Bot chose ${formatName(botMove.name)}.`);

    attemptAttack(player, bot, playerMove, botMove);

    if (bot.hp <= 0) break;

    attemptAttack(bot, player, botMove, playerMove);

    round++;
  }

  printStatus(player, bot);

  if (player.hp > 0) {
    console.log(`${formatName(player.name)} wins.`);
  } else {
    console.log(`${formatName(bot.name)} wins.`);
  }
}

async function main() {
  try {
    console.log("Pokémon battle simulator starting...");
    console.log("Each Pokémon starts with 300 HP.\n");

    const player = await askPlayerPokemon();
    const bot = await getRandomBotPokemon(player.name);

    await battle(player, bot);
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    rl.close();
  }
}

main();