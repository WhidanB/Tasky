require("dotenv").config(); // Charger les variables d'environnement depuis le fichier .env
const { Client, GatewayIntentBits } = require("discord.js");
const fs = require("fs");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Créer une collection de commandes
client.commands = new Map();

// Charger toutes les commandes à partir du dossier 'commands'
const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("messageCreate", (message) => {
  if (message.author.bot) return;

  const args = message.content.slice(1).trim().split(/ +/); // Divise le message en arguments
  const commandName = args.shift().toLowerCase(); // Extrait le nom de la commande

  // Vérifier si la commande existe
  const command = client.commands.get(commandName);

  if (!command) return;

  try {
    // Exécuter la commande correspondante
    command.execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply(
      "Il y a eu une erreur en essayant d'exécuter cette commande."
    );
  }
});

client.login(process.env.DISCORD_TOKEN);
