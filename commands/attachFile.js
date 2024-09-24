// commands/attachFile.js
const { getHomeworkList, saveHomework } = require("../utils/homeworkManager");
const fs = require("fs");
const path = require("path");
const axios = require("axios"); // Bibliothèque pour télécharger les fichiers

module.exports = {
  name: "associerfichier",
  description: "Associe un fichier (ex: PDF) à un devoir",
  async execute(message, args) {
    const homeworkId = parseInt(args[0]); // L'ID du devoir

    let homeworkList = getHomeworkList();
    const homework = homeworkList.find((h) => h.id === homeworkId);

    if (!homework) {
      return message.channel.send("Devoir introuvable.");
    }

    // Vérifier si un fichier a été attaché
    if (message.attachments.size === 0) {
      return message.channel.send("Aucun fichier n'a été attaché.");
    }

    // Prendre le premier fichier attaché
    const attachment = message.attachments.first();
    const fileUrl = attachment.url;
    const fileName = `${homeworkId}-${attachment.name}`;
    const filePath = path.join(__dirname, "../uploads", fileName);

    // Ajouter des logs pour suivre l'état du téléchargement
    console.log(`Téléchargement du fichier depuis : ${fileUrl}`);
    console.log(`Chemin où le fichier sera enregistré : ${filePath}`);

    // Télécharger et sauvegarder le fichier dans le dossier 'uploads'
    try {
      const response = await axios({
        url: fileUrl,
        method: "GET",
        responseType: "stream",
      });

      // Sauvegarder le fichier dans le dossier 'uploads'
      const writer = fs.createWriteStream(filePath);

      response.data.pipe(writer);

      writer.on("finish", () => {
        console.log(`Fichier sauvegardé avec succès à : ${filePath}`);

        // Mettre à jour le devoir avec l'URL du fichier local
        homework.file = `/uploads/${fileName}`;
        saveHomework(homeworkList);

        message.channel.send(
          `Fichier associé au devoir : [${homework.subject}] ${homework.description}`
        );
      });

      writer.on("error", (err) => {
        console.error(`Erreur lors de l'écriture du fichier : ${err}`);
        message.channel.send("Erreur lors de la sauvegarde du fichier.");
      });
    } catch (error) {
      console.error("Erreur lors du téléchargement du fichier :", error);
      message.channel.send("Erreur lors du téléchargement du fichier.");
    }
  },
};
