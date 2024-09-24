const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "help",
  description:
    "Affiche la liste des commandes disponibles et leur fonctionnement",
  async execute(message) {
    // Créer un embed pour afficher les informations des commandes
    const embed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle("Liste des commandes")
      .setDescription("Voici les commandes disponibles pour gérer les devoirs")
      .addFields(
        {
          name: "!ajoutdevoir",
          value:
            "Ajoute un nouveau devoir. Usage : `!ajoutdevoir [titre] [description] [date DD-MM-AAAA]`",
          inline: false,
        },
        {
          name: "!modifierdevoir",
          value:
            "Modifie un devoir existant. Usage : `!modifierdevoir [ID] [nouveau titre] [nouvelle description] [nouvelle date DD-MM-AAAA]`",
          inline: false,
        },
        {
          name: "!supprimerdevoir",
          value:
            "Supprime un devoir par son ID. Usage : `!supprimerdevoir [ID]`",
          inline: false,
        },
        {
          name: "!devoirs",
          value: "Affiche tous les devoirs enregistrés.",
          inline: false,
        },
        {
          name: "!tridevoirs",
          value:
            "Trie les devoirs par matière sélectionnée via un menu déroulant.",
          inline: false,
        },
        {
          name: "!help",
          value: "Affiche cette liste de commandes.",
          inline: false,
        }
      )
      .setFooter({
        text: "Utilise ces commandes pour gérer les devoirs efficacement !",
      });

    // Envoyer l'embed d'aide
    await message.channel.send({ embeds: [embed] });
  },
};
