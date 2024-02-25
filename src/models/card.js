const mongoose = require('mongoose');

const { Schema } = mongoose;

const checklistSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
});

const cardSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  priorityColor: {
    type: String,
    required: true,
  },
  priorityText: {
    type: String,
    required: true,
  },
  checklists: [checklistSchema],
  dueDate: {
    type: Date,
  },
  tag: {
    type: String,
    enum: ['Todo', 'In Progress', 'Done', 'Backlog'],
    required: true,
  },
});

const Card = mongoose.model('Card', cardSchema);

module.exports = Card;
