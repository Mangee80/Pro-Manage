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
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastModified: {
    type: Date,
    default: Date.now,
  },
  activityHistory: [{
    date: {
      type: Date,
      default: Date.now,
    },
    action: {
      type: String,
      enum: ['created', 'modified', 'checked', 'unchecked', 'deleted'],
    },
  }],
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
    type: String
  },
  tag: {
    type: String,
    enum: ['Todo', 'In Progress', 'Done', 'Backlog'],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  statusHistory: [{
    status: {
      type: String,
      enum: ['Todo', 'In Progress', 'Done', 'Backlog'],
    },
    date: {
      type: Date,
      default: Date.now,
    },
  }],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true
  }
});

const Card = mongoose.model('Card', cardSchema);

module.exports = Card;
