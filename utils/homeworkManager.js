// utils/homeworkManager.js
const fs = require("fs");
const path = require("path");

// Chemin vers le fichier JSON pour stocker les devoirs et le compteur global
const homeworkFilePath = path.join(__dirname, "../homeworkData.json");

// Charger les devoirs et le compteur depuis le fichier JSON
function loadHomeworkData() {
  try {
    const dataBuffer = fs.readFileSync(homeworkFilePath);
    const dataJSON = dataBuffer.toString();
    const data = JSON.parse(dataJSON);
    return data;
  } catch (e) {
    // Si le fichier est vide ou n'existe pas, initialiser une structure de données vide
    return { homeworkList: [], nextId: 1 };
  }
}

// Sauvegarder les devoirs et le compteur dans le fichier JSON
function saveHomeworkData(homeworkData) {
  const dataJSON = JSON.stringify(homeworkData, null, 2);
  fs.writeFileSync(homeworkFilePath, dataJSON);
}

// Ajouter un devoir avec un ID séquentiel
function addHomework(homework) {
  const homeworkData = loadHomeworkData();
  homework.id = homeworkData.nextId; // Assigner un ID séquentiel au devoir
  homeworkData.homeworkList.push(homework);
  homeworkData.nextId++; // Incrémenter le compteur pour le prochain devoir
  saveHomeworkData(homeworkData); // Sauvegarder les données mises à jour
}

// Récupérer la liste des devoirs
function getHomeworkList() {
  const homeworkData = loadHomeworkData();
  return homeworkData.homeworkList;
}

// Sauvegarder la liste des devoirs
function saveHomework(homeworkList) {
  const homeworkData = loadHomeworkData();
  homeworkData.homeworkList = homeworkList; // Mettre à jour la liste
  saveHomeworkData(homeworkData); // Sauvegarder avec le compteur inchangé
}

module.exports = { addHomework, getHomeworkList, saveHomework };
