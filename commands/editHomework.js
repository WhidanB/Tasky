const { getHomeworkList, saveHomework } = require("../utils/homeworkManager");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

function isValidDate(dateString) {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}

module.exports = {
  name: "modifierdevoir", // Commande en français
  description: "Modifie un devoir existant avec de nouvelles informations",
  async execute(message, args) {
    // Validation des arguments
    if (args.length < 4) {
      return message.channel.send(
        "Format incorrect. Utilisez : !modifierdevoir [ID] [nouvelle matière] [nouvelle description] [nouvelle date]"
      );
    }

    const homeworkId = parseInt(args[0]);
    const newSubject = args[1];
    const newDescription = args.slice(2, -1).join(" ");
    const newDueDate = args[args.length - 1];

    // Validation de la date
    if (!isValidDate(newDueDate)) {
      return message.channel.send(
        "Date invalide. Utilisez le format AAAA-MM-JJ."
      );
    }

    // Récupérer la liste des devoirs
    let homeworkList = getHomeworkList();
    const homework = homeworkList.find((h) => h.id === homeworkId);

    if (!homework) {
      return message.channel.send("Devoir introuvable.");
    }

    // Modifier les propriétés du devoir
    homework.subject = newSubject;
    homework.description = newDescription;
    homework.dueDate = newDueDate;

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
          } else {
            console.log(`Ancien fichier supprimé : ${homework.file}`);
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
          console.log(
            `Fichier modifié et sauvegardé avec succès à : ${filePath}`
          );

          // Mettre à jour le chemin du fichier dans le devoir
          homework.file = `/uploads/${fileName}`;

          // Sauvegarder la liste des devoirs avec les modifications
          saveHomework(homeworkList);
          message.channel.send(
            `Devoir modifié avec succès : ID: ${homework.id} - ${homework.subject}`
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
      // Sauvegarder les modifications sans changer de fichier
      saveHomework(homeworkList);
      message.channel.send(
        `Devoir modifié avec succès : ID: ${homework.id} - ${homework.subject}`
      );
    }
  },
};
