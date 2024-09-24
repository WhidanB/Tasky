const { EmbedBuilder, AttachmentBuilder } = require("discord.js");
const { getHomeworkList } = require("../utils/homeworkManager");
const path = require("path");
const fs = require("fs");

// Liste des matières avec emojis et couleurs associés
const subjects = [
  { label: "Web", value: "Web", emoji: "🌐", color: "#1f8b4c" }, // Vert
  { label: "Réseau", value: "Réseau", emoji: "📡", color: "#3498db" }, // Bleu
  { label: "JAVA", value: "JAVA", emoji: "☕", color: "#e67e22" }, // Orange
  {
    label: "Communication",
    value: "Communication",
    emoji: "💬",
    color: "#9b59b6",
  }, // Violet
  { label: "Anglais", value: "Anglais", emoji: "🇬🇧", color: "#2980b9" }, // Bleu Foncé
  { label: "SQL", value: "SQL", emoji: "💾", color: "#f1c40f" }, // Jaune
];

module.exports = {
  name: "devoirs",
  description: "Affiche tous les devoirs ajoutés",
  async execute(message) {
    // Récupérer la liste des devoirs
    const homeworkList = getHomeworkList();

    // Vérifier si la liste est vide
    if (homeworkList.length === 0) {
      return message.channel.send(
        "Aucun devoir n'a été ajouté pour le moment."
      );
    }

    // Afficher chaque devoir
    for (const homework of homeworkList) {
      const subjectInfo = subjects.find((s) => s.value === homework.subject);

      const embed = new EmbedBuilder()
        .setColor(subjectInfo ? subjectInfo.color : "#ffffff")
        .setTitle(`${subjectInfo ? subjectInfo.emoji : ""} ${homework.title}`)
        .setDescription(homework.description)
        .addFields(
          { name: "Matière", value: homework.subject, inline: true },
          { name: "Date de rendu", value: homework.dueDate, inline: true }
        )
        .setFooter({ text: `Devoir ID: ${homework.id}` });

      // Envoyer l'embed en premier
      await message.channel.send({ embeds: [embed] });

      // Si un fichier est associé au devoir, joindre le fichier après l'embed
      if (homework.file) {
        const filePath = path.join(__dirname, "..", homework.file);

        if (fs.existsSync(filePath)) {
          const attachment = new AttachmentBuilder(filePath);
          await message.channel.send({ files: [attachment] });
        } else {
          await message.channel.send("Fichier introuvable.");
        }
      }
    }
  },
};
