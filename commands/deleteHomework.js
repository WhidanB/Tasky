// commands/deleteHomework.js
const { getHomeworkList, saveHomework } = require("../utils/homeworkManager");

module.exports = {
  name: "supprimerdevoir",
  description: "Supprime un devoir par son numéro",
  execute(message, args) {
    const homeworkId = parseInt(args[0]); // ID du devoir (un entier)

    let homeworkList = getHomeworkList();
    const homeworkIndex = homeworkList.findIndex(
      (homework) => homework.id === homeworkId
    );

    if (homeworkIndex === -1) {
      return message.channel.send("Devoir introuvable.");
    }

    const deletedHomework = homeworkList.splice(homeworkIndex, 1); // Supprimer le devoir
    saveHomework(homeworkList); // Sauvegarder la nouvelle liste

    message.channel.send(
      `Devoir supprimé : [${deletedHomework[0].subject}] ${deletedHomework[0].description}`
    );
  },
};
