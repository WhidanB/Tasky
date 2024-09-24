require("dotenv").config();
const {
  getHomeworkList,
  saveHomework,
  resetIdCounter,
} = require("../utils/homeworkManager");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "supprimerdevoir",
  description: "Supprime un devoir par son numéro",
  execute(message, args) {
    if (message.channel.id !== process.env.ALLOWED_CHANNEL) {
      return message.channel.send(
        "Cette commande ne peut être utilisée que dans le salon #cahier-de-texte."
      );
    }

    const homeworkId = parseInt(args[0]);

    let homeworkList = getHomeworkList();
    const homeworkIndex = homeworkList.findIndex(
      (homework) => homework.id === homeworkId
    );

    if (homeworkIndex === -1) {
      return message.channel.send("Devoir introuvable.");
    }

    const deletedHomework = homeworkList.splice(homeworkIndex, 1);

    // Supprimer le fichier associé, s'il existe
    if (deletedHomework[0].file) {
      const filePath = path.join(__dirname, "..", deletedHomework[0].file);
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("Erreur lors de la suppression du fichier :", err);
        }
      });
    }

    if (homeworkList.length === 0) {
      resetIdCounter(); // Appel de la fonction pour réinitialiser le compteur
      message.channel.send(
        "Tous les devoirs ont été supprimés. Le compteur d'ID est réinitialisé."
      );
    } else {
      saveHomework(homeworkList);
      message.channel.send(
        `Devoir supprimé : [${deletedHomework[0].subject}] ${deletedHomework[0].description}`
      );
    }
  },
};
