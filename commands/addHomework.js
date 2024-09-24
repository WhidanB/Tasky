// commands/addHomework.js
const Homework = require("../models/homework");
const { addHomework } = require("../utils/homeworkManager");

// Fonction pour valider la date au format AAAA-MM-JJ
function isValidDate(dateString) {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date); // Vérifie si c'est une date valide
}

module.exports = {
  name: "ajoutdevoir",
  description:
    "Ajoute un devoir avec la matière, description et la date de rendu",
  execute(message, args) {
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

    // Création du nouveau devoir avec un ID séquentiel généré automatiquement
    const newHomework = new Homework(subject, description, dueDate);
    addHomework(newHomework); // Ajoute le devoir et l'enregistre avec un ID séquentiel

    message.channel.send(
      `Devoir ajouté : ID: ${newHomework.id} - ${subject} - ${description} (à rendre pour le ${dueDate})`
    );
  },
};
