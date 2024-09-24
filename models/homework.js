// models/homework.js
class Homework {
  constructor(subject, description, dueDate, file = null) {
    this.id = null; // L'ID sera généré plus tard par le gestionnaire
    this.subject = subject;
    this.description = description;
    this.dueDate = dueDate;
    this.file = file;
  }

  setFile(fileUrl) {
    this.file = fileUrl;
  }
}

module.exports = Homework;
