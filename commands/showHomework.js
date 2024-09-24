const { getHomeworkList } = require("../utils/homeworkManager");
const path = require("path");
const { AttachmentBuilder } = require("discord.js"); // Importer AttachmentBuilder pour envoyer des fichiers

module.exports = {
  name: "devoirs",
  description: "Affiche la liste des devoirs, possibilité de trier par matière",
  async execute(message, args) {
    const subjectFilter = args[0];
    const homeworkList = getHomeworkList();

    if (homeworkList.length === 0) {
      return message.channel.send("Aucun devoir enregistré.");
    }

    let filteredHomeworkList = homeworkList;

    if (subjectFilter) {
      filteredHomeworkList = filteredHomeworkList.filter(
        (homework) =>
          homework.subject.toLowerCase() === subjectFilter.toLowerCase()
      );
    }

    for (const homework of filteredHomeworkList) {
      let homeworkMessage = `ID: ${homework.id} - [${homework.subject}] ${homework.description} - à rendre pour le ${homework.dueDate}\n`;

      // Si un fichier est associé au devoir, on l'envoie en tant que pièce jointe
      if (homework.file) {
        const filePath = path.join(__dirname, "..", homework.file);
        try {
          const attachment = new AttachmentBuilder(filePath); // Créer la pièce jointe
          await message.channel.send({
            content: homeworkMessage,
            files: [attachment], // Joindre le fichier
          });
        } catch (err) {
          console.error("Erreur lors de l'envoi du fichier :", err);
          await message.channel.send(
            `Impossible d'envoyer le fichier associé au devoir [${homework.subject}].`
          );
        }
      } else {
        await message.channel.send(homeworkMessage); // Pas de fichier, on envoie juste le texte
      }
    }
  },
};
