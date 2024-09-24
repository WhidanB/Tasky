// commands/showHomework.js
const { getHomeworkList } = require("../utils/homeworkManager");

module.exports = {
  name: "devoirs",
  description: "Affiche la liste des devoirs, possibilité de trier par matière",
  execute(message, args) {
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

    let homeworkMessage = "Liste des devoirs :\n";
    filteredHomeworkList.forEach((homework) => {
      homeworkMessage += `ID: ${homework.id} - [${homework.subject}] ${homework.description} - à rendre pour le ${homework.dueDate}\n`;
      if (homework.file) {
        homeworkMessage += `  ➡️ Fichier : ${homework.file}\n`;
      }
    });

    message.channel.send(homeworkMessage);
  },
};
