const Homework = require("../models/homework");
const { addHomework } = require("../utils/homeworkManager");
const fs = require("fs");
const path = require("path");
const axios = require("axios"); // Bibliothèque pour télécharger les fichiers

// Fonction pour valider la date au format AAAA-MM-JJ
function isValidDate(dateString) {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date); // Vérifie si c'est une date valide
}

module.exports = {
  name: "ajoutdevoir",
  description:
    "Ajoute un devoir avec la matière, description, date de rendu, et fichier optionnel",
  async execute(message, args) {
    // Validation des arguments
    if (args.length < 3) {
      return message.channel.send(
        "Format incorrect. Utilisez : !ajoutdevoir [matière] [description] [date de rendu]"
      );
    }

    const subject = args[0]; // Première argument : la matière
    const description = args.slice(1, -1).join(" "); // La description (tous les arguments sauf le dernier)
    const dueDate = args[args.length - 1]; // Dernier argument : la date de rendu

    // Validation de la date
    if (!isValidDate(dueDate)) {
      return message.channel.send(
        "Date invalide. Utilisez le format AAAA-MM-JJ."
      );
    }

    // Création du nouveau devoir
    const newHomework = new Homework(subject, description, dueDate);

    // Si un fichier est attaché au message, le télécharger
    if (message.attachments.size > 0) {
      const attachment = message.attachments.first();
      const fileUrl = attachment.url;
      const fileName = attachment.name; // Utiliser uniquement le nom original du fichier
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
          console.log(
            `Fichier téléchargé et sauvegardé avec succès à : ${filePath}`
          );

          // Associer le fichier au devoir
          newHomework.file = `/uploads/${fileName}`;
          addHomework(newHomework); // Ajouter le devoir avec le fichier associé

          message.channel.send(
            `Devoir ajouté avec fichier : ${subject} - ${description} (à rendre pour le ${dueDate})`
          );
        });

        writer.on("error", (err) => {
          console.error(`Erreur lors de l'écriture du fichier : ${err}`);
          message.channel.send("Erreur lors de la sauvegarde du fichier.");
        });
      } catch (error) {
        console.error("Erreur lors du téléchargement du fichier :", error);
        return message.channel.send(
          "Erreur lors du téléchargement du fichier."
        );
      }
    } else {
      // Aucun fichier joint, ajouter le devoir sans fichier
      addHomework(newHomework);
      message.channel.send(
        `Devoir ajouté : ${subject} - ${description} (à rendre pour le ${dueDate})`
      );
    }
  },
};
