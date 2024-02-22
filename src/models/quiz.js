const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  value: {
    type: String,
    required: true
  },
  image: {
    type: String
  }
});

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true
  },
  options: [optionSchema],
  type: {
    type: String,
    enum: ['text', 'image', 'textAndImage'],
    required: true
  },
  answer: {
    type: String,
    required: true
  }
});


const Question = mongoose.model('Question', questionSchema);

module.exports = Question;
