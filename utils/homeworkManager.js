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
    if (!data.homeworkList || !Array.isArray(data.homeworkList)) {
      data.homeworkList = [];
    }
    if (typeof data.nextId !== "number") {
      data.nextId = 1;
    }
    return data;
  } catch (e) {
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
  homework.id = homeworkData.nextId;
  homeworkData.homeworkList.push(homework);
  homeworkData.nextId++;
  saveHomeworkData(homeworkData);
}

// Récupérer la liste des devoirs
function getHomeworkList() {
  const homeworkData = loadHomeworkData();
  return homeworkData.homeworkList;
}

// Sauvegarder uniquement la liste des devoirs
function saveHomework(homeworkList) {
  const homeworkData = loadHomeworkData();
  homeworkData.homeworkList = homeworkList;
  saveHomeworkData(homeworkData);
}

// Réinitialiser le compteur d'ID à 1
function resetIdCounter() {
  const homeworkData = loadHomeworkData();
  homeworkData.nextId = 1;
  homeworkData.homeworkList = [];
  saveHomeworkData(homeworkData);
}

module.exports = { addHomework, getHomeworkList, saveHomework, resetIdCounter };
