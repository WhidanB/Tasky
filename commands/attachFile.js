// commands/attachFile.js
const { getHomeworkList, saveHomework } = require('../utils/homeworkManager');

module.exports = {
    name: 'associerfichier',
    description: 'Associe un fichier (ex: PDF) à un devoir',
    execute(message, args) {
        const homeworkIndex = parseInt(args[0]) - 1;  // Le numéro du devoir (1-indexé)

        const homeworkList = getHomeworkList();
        if (homeworkIndex < 0 || homeworkIndex >= homeworkList.length) {
            return message.channel.send('Devoir invalide.');
        }

        if (message.attachments.size === 0) {
            return message.channel.send('Aucun fichier n\'a été attaché.');
        }

        const file = message.attachments.first();  // Prendre le premier fichier attaché
        const fileUrl = file.url;

        homeworkList[homeworkIndex].file = fileUrl;  // Associer l'URL du fichier
        saveHomework(homeworkList);  // Sauvegarder dans le fichier JSON

        message.channel.send(`Fichier associé au devoir [${homeworkList[homeworkIndex].subject}] - ${homeworkList[homeworkIndex].description}`);
    }
};
