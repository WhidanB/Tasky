require("dotenv").config();
const { ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");
const { getHomeworkList, saveHomework } = require("../utils/homeworkManager");
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
  name: "modifierdevoir",
  description:
    "Modifie un devoir existant avec titre, matière, description, date de rendu et fichier optionnel",
  async execute(message, args) {
    if (message.channel.id !== process.env.ALLOWED_CHANNEL) {
      return message.channel.send(
        "Cette commande ne peut être utilisée que dans le salon #cahier-de-texte."
      );
    }

    // Validation des arguments (ID du devoir, titre, description, date)
    if (args.length < 4) {
      return message.channel.send(
        "Format incorrect. Utilisez : !modifierdevoir [ID du devoir] [nouveau titre] [nouvelle description] [nouvelle date DD-MM-AAAA]"
      );
    }

    const homeworkId = parseInt(args[0]);
    const newTitle = args[1];
    const newDescription = args.slice(2, args.length - 1).join(" ");
    const newDueDate = args[args.length - 1];

    // Validation de la date au format DD-MM-AAAA
    const parsedDate = parseDate(newDueDate);
    if (!parsedDate) {
      return message.channel.send(
        "Date invalide. Utilisez le format DD-MM-AAAA."
      );
    }

    // Récupérer la liste des devoirs
    let homeworkList = getHomeworkList();
    const homework = homeworkList.find((h) => h.id === homeworkId);

    if (!homework) {
      return message.channel.send("Devoir introuvable.");
    }

    // Créer un menu déroulant pour choisir la nouvelle matière
    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("selectSubjectEdit")
        .setPlaceholder("Choisir une nouvelle matière...")
        .addOptions(
          subjects.map((subject) => ({
            label: subject.label,
            value: subject.value,
            emoji: subject.emoji,
          }))
        )
    );

    // Envoyer le message avec le menu déroulant pour choisir la matière
    const selectMessage = await message.channel.send({
      content: "Veuillez choisir une nouvelle matière pour le devoir :",
      components: [row],
    });

    // Créer un collecteur pour capturer l'interaction avec le menu
    const filter = (i) =>
      i.user.id === message.author.id && i.customId === "selectSubjectEdit";
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

      // Mettre à jour le devoir avec le nouveau titre, description, date, matière et emoji
      homework.subject = selectedSubject;
      homework.title = newTitle;
      homework.description = newDescription;
      homework.dueDate = parsedDate;
      homework.emoji = subjectEmoji;

      // Si un fichier est joint, le remplacer
      if (message.attachments.size > 0) {
        const attachment = message.attachments.first();
        const fileUrl = attachment.url;
        const fileName = attachment.name;
        const filePath = path.join(__dirname, "../uploads", fileName);

        // Supprimer l'ancien fichier s'il existe
        if (homework.file) {
          const oldFilePath = path.join(__dirname, "..", homework.file);
          fs.unlink(oldFilePath, (err) => {
            if (err) {
              console.error(
                `Erreur lors de la suppression de l'ancien fichier : ${err}`
              );
            }
          });
        }

        try {
          // Télécharger et sauvegarder le nouveau fichier
          const response = await axios({
            url: fileUrl,
            method: "GET",
            responseType: "stream",
          });

          const writer = fs.createWriteStream(filePath);
          response.data.pipe(writer);

          writer.on("finish", () => {
            homework.file = `/uploads/${fileName}`; // Associer correctement le fichier
            saveHomework(homeworkList);
            message.channel.send(
              `${subjectEmoji} Devoir modifié : ${newTitle} - ${newDescription} (à rendre pour le ${parsedDate})`
            );
          });

          writer.on("error", (err) => {
            message.channel.send("Erreur lors de la sauvegarde du fichier.");
          });
        } catch (error) {
          message.channel.send("Erreur lors du téléchargement du fichier.");
        }
      } else {
        // Sauvegarder le devoir sans changement de fichier
        saveHomework(homeworkList);
        message.channel.send(
          `${subjectEmoji} Devoir modifié : ${newTitle} - ${newDescription} (à rendre pour le ${parsedDate})`
        );
      }
    });

    // Gérer le cas où l'utilisateur ne sélectionne pas de matière
    collector.on("end", (collected) => {
      if (!collected.size) {
        message.channel.send("Temps écoulé, aucune matière sélectionnée.");
      }
    });
  },
};
