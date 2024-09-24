const { Client, GatewayIntentBits } = require("discord.js");
const fs = require("fs");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Create a collection to hold all commands
client.commands = new Map();

// Load all command files from the 'commands' folder
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

  const args = message.content.slice(1).trim().split(/ +/); // Split the message content into arguments
  const commandName = args.shift().toLowerCase(); // Extract the command name

  // Check if the command exists
  const command = client.commands.get(commandName);

  if (!command) return;

  try {
    // Execute the corresponding command
    command.execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply(
      "Il y a eu une erreur en essayant d'exécuter cette commande."
    );
  }
});

client.login();
