// models/homework.js
class Homework {
  constructor(subject, title, description, dueDate, file = null) {
    this.subject = subject;
    this.title = title;
    this.description = description;
    this.dueDate = dueDate;
    this.file = file; // URL du fichier (local ou distant)
  }

  setFile(fileUrl) {
    this.file = fileUrl;
  }
}

module.exports = Homework;
