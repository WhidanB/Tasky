require("dotenv").config();
const { ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");
const Homework = require("../models/homework");
const { addHomework } = require("../utils/homeworkManager");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

// Liste des matières prédéfinies avec leurs emojis correspondants
const subjects = [
  { label: "Web", value: "Web", emoji: "🌐" },
  { label: "Réseau", value: "Réseau", emoji: "📡" },
  { label: "JAVA", value: "JAVA", emoji: "☕" },
  { label: "Communication", value: "Communication", emoji: "💬" },
  { label: "Anglais", value: "Anglais", emoji: "🇬🇧" },
  { label: "SQL", value: "SQL", emoji: "💾" },
];

// Fonction pour valider et convertir la date du format DD-MM-AAAA au format ISO (AAAA-MM-DD)
function parseDate(input) {
  const regex = /^(\d{2})-(\d{2})-(\d{4})$/;
  const match = input.match(regex);
  if (!match) return null;

  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);

  const date = new Date(`${year}-${month}-${day}`);
  if (isNaN(date.getTime())) return null;

  return `${year}-${month < 10 ? "0" : ""}${month}-${
    day < 10 ? "0" : ""
  }${day}`;
}

module.exports = {
  name: "ajoutdevoir",
  description:
    "Ajoute un devoir avec un titre, matière, description, date de rendu, et fichier optionnel",
  async execute(message, args) {
    // Validation des arguments (titre, description et date)

    if (message.channel.id !== process.env.ALLOWED_CHANNEL) {
      return message.channel.send(
        "Cette commande ne peut être utilisée que dans le salon #cahier-de-texte."
      );
    }

    if (args.length < 3) {
      return message.channel.send(
        "Format incorrect. Utilisez : !ajoutdevoir [titre] [description] [date DD-MM-AAAA]"
      );
    }

    const title = args[0]; // Titre du devoir
    const description = args.slice(1, args.length - 1).join(" ");
    const dueDate = args[args.length - 1]; // Date de rendu

    // Validation de la date au format DD-MM-AAAA
    const parsedDate = parseDate(dueDate);
    if (!parsedDate) {
      return message.channel.send(
        "Date invalide. Utilisez le format DD-MM-AAAA."
      );
    }

    // Créer un menu déroulant pour la sélection de la matière
    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("selectSubject")
        .setPlaceholder("Choisir une matière...")
        .addOptions(
          subjects.map((subject) => ({
            label: subject.label,
            value: subject.value,
            emoji: subject.emoji,
          }))
        )
    );

    // Envoyer un message avec le menu déroulant pour choisir la matière
    const selectMessage = await message.channel.send({
      content: "Veuillez choisir une matière pour le devoir :",
      components: [row],
    });

    // Créer un collecteur pour capturer la sélection de la matière
    const filter = (i) =>
      i.user.id === message.author.id && i.customId === "selectSubject";
    const collector = selectMessage.createMessageComponentCollector({
      filter,
      time: 60000,
      max: 1,
    });

    let selectedSubject;

    collector.on("collect", async (interaction) => {
      selectedSubject = interaction.values[0]; // Matière choisie
      const subjectEmoji = subjects.find(
        (s) => s.value === selectedSubject
      ).emoji; // Emoji de la matière
      await interaction.deferUpdate(); // Fermer le menu

      // Création du nouveau devoir avec titre, description, date, matière et emoji
      const newHomework = new Homework(
        selectedSubject,
        title,
        description,
        parsedDate,
        subjectEmoji
      );

      // Si un fichier est attaché, le télécharger
      if (message.attachments.size > 0) {
        const attachment = message.attachments.first();
        const fileUrl = attachment.url;
        const fileName = attachment.name;
        const filePath = path.join(__dirname, "../uploads", fileName);

        try {
          // Télécharger et sauvegarder le fichier
          const response = await axios({
            url: fileUrl,
            method: "GET",
            responseType: "stream",
          });

          const writer = fs.createWriteStream(filePath);
          response.data.pipe(writer);

          writer.on("finish", () => {
            newHomework.file = `/uploads/${fileName}`; // Associer correctement le fichier
            addHomework(newHomework);
            message.channel.send(
              `${subjectEmoji} Devoir ajouté : ${title} - ${description} (à rendre pour le ${parsedDate})`
            );
          });

          writer.on("error", (err) => {
            message.channel.send("Erreur lors de la sauvegarde du fichier.");
          });
        } catch (error) {
          message.channel.send("Erreur lors du téléchargement du fichier.");
        }
      } else {
        // Ajouter le devoir sans fichier
        newHomework.file = null; // Aucun fichier attaché
        addHomework(newHomework);
        message.channel.send(
          `${subjectEmoji} Devoir ajouté : ${title} - ${description} (à rendre pour le ${parsedDate})`
        );
      }
    });

    // Gérer le cas où l'utilisateur ne sélectionne pas de matière
    collector.on("end", (collected) => {
      if (!collected.size) {
        message.channel.send(
          "Temps écoulé, vous n'avez pas sélectionné de matière."
        );
      }
    });
  },
};
