const inquirer = require("inquirer");
const { fetchPokemon } = require("./api");
const { attack } = require("./battle");
const { botChooseMove } = require("./bot");
const { showHp, showMoves } = require("./display");
const chalk = require("chalk");

async function main() {
  console.log(chalk.yellow("⚡ BIENVENUE DANS POKEMON BATTLE ⚡\n"));

  // 1. Le joueur choisit son Pokémon via inquirer
  const { playerName } = await inquirer.prompt([
    {
      type: "input",
      name: "playerName",
      message: "Entrez le nom de votre Pokémon :",
    }
  ]);

  console.log("⏳ Chargement...");
  const playerPokemon = await fetchPokemon(playerName.toLowerCase());

  // 2. Le bot choisit un Pokémon au hasard
  const botNames = ["pikachu", "bulbasaur", "charmander", "squirtle", "gengar"];
  const randomBot = botNames[Math.floor(Math.random() * botNames.length)];
  const botPokemon = await fetchPokemon(randomBot);

  // 3. Créer les états
  const player = { ...playerPokemon, hp: 300 };
  const bot    = { ...botPokemon,    hp: 300 };

  console.log(chalk.green(`\n✅ Vous jouez avec : ${player.name}`));
  console.log(chalk.red(`🤖 Le bot joue avec : ${bot.name}\n`));

  // 4. Boucle de jeu
  while (player.hp > 0 && bot.hp > 0) {

    console.log("\n" + "=".repeat(40));
    showHp(player.name, player.hp);
    showHp(bot.name, bot.hp);

    // Construire les choix pour inquirer
    const moveChoices = player.moves.map((m, i) => ({
      name: `${m.name} | 💥 Power: ${m.power} | 🎯 Accuracy: ${m.accuracy}% | PP: ${m.currentPp}`,
      value: i
    }));

    // Le joueur choisit avec les flèches du clavier !
    const { choice } = await inquirer.prompt([
      {
        type: "list",
        name: "choice",
        message: "🎮 Choisissez votre attaque :",
        choices: moveChoices
      }
    ]);

    attack(player, bot, choice);

    if (bot.hp <= 0) break;

    // Tour du bot
    console.log(chalk.red(`\n🤖 ${bot.name} attaque...`));
    const botChoice = botChooseMove(bot);
    attack(bot, player, botChoice);
  }

  // 5. Résultat
  console.log("\n" + "=".repeat(40));
  if (player.hp > 0) {
    console.log(chalk.green("🏆 VOUS AVEZ GAGNÉ !"));
  } else {
    console.log(chalk.red("💀 VOUS AVEZ PERDU !"));
  }
}

main();