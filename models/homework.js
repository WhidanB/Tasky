// models/homework.js
class Homework {
  constructor(subject, description, dueDate, file = null) {
    this.id; // L'ID sera assigné lors de l'ajout
    this.subject = subject;
    this.description = description;
    this.dueDate = dueDate;
    this.file = file; // URL du fichier (local ou distant)
  }

  setFile(fileUrl) {
    this.file = fileUrl;
  }
}

module.exports = Homework;
