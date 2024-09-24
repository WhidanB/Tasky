const {
  EmbedBuilder,
  StringSelectMenuBuilder,
  ActionRowBuilder,
  AttachmentBuilder,
} = require("discord.js");
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
  name: "tridevoirs",
  description: "Trie les devoirs par matière sélectionnée",
  async execute(message) {
    // Créer un menu déroulant avec les matières disponibles
    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("selectSubjectSort")
        .setPlaceholder("Choisir une matière pour trier...")
        .addOptions(
          subjects.map((subject) => ({
            label: subject.label,
            value: subject.value,
            emoji: subject.emoji,
          }))
        )
    );

    // Envoyer le menu déroulant pour sélectionner une matière
    const selectMessage = await message.channel.send({
      content: "Veuillez choisir une matière pour trier les devoirs :",
      components: [row],
    });

    // Créer un collecteur pour capturer l'interaction avec le menu
    const filter = (i) =>
      i.user.id === message.author.id && i.customId === "selectSubjectSort";
    const collector = selectMessage.createMessageComponentCollector({
      filter,
      time: 60000,
      max: 1,
    });

    collector.on("collect", async (interaction) => {
      const selectedSubject = interaction.values[0]; // Matière choisie
      await interaction.deferUpdate(); // Fermer le menu

      // Récupérer la liste des devoirs et trier par la matière sélectionnée
      const homeworkList = getHomeworkList().filter(
        (homework) => homework.subject === selectedSubject
      );

      // Vérifier si des devoirs sont trouvés pour cette matière
      if (homeworkList.length === 0) {
        return message.channel.send(
          `Aucun devoir trouvé pour la matière ${selectedSubject}.`
        );
      }

      // Afficher les devoirs triés par la matière sélectionnée
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
    });

    // Gérer le cas où l'utilisateur ne fait pas de sélection dans le délai imparti
    collector.on("end", (collected) => {
      if (!collected.size) {
        message.channel.send(
          "Temps écoulé, vous n'avez pas sélectionné de matière."
        );
      }
    });
  },
};
