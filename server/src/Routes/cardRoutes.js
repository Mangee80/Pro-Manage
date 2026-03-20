const express = require('express');
const router = express.Router();
const Card = require('../Models/cards');
const { authenticateToken } = require('../middleware/authMiddleware');

const DAY_MS = 1000 * 60 * 60 * 24;
const BOTTLENECK_DAYS = 7;

const diffInDays = (start, end) => {
  if (!start || !end) return 0;
  const startDate = new Date(start);
  const endDate = new Date(end);
  const ms = endDate - startDate;
  if (ms <= 0) return 0;
  return Math.ceil(ms / DAY_MS);
};

const normalizeHistory = (card, createdAt) => {
  const history = Array.isArray(card.statusHistory) ? [...card.statusHistory] : [];
  if (history.length === 0) {
    return [{ status: card.tag || 'Todo', date: createdAt }];
  }

  const sorted = history
    .map((entry) => ({
      status: entry.status || card.tag || 'Todo',
      date: new Date(entry.date),
    }))
    .filter((entry) => !Number.isNaN(entry.date.getTime()))
    .sort((a, b) => a.date - b.date);

  if (sorted.length === 0) {
    return [{ status: card.tag || 'Todo', date: createdAt }];
  }

  if (sorted[0].date > createdAt) {
    sorted.unshift({ status: sorted[0].status, date: createdAt });
  } else {
    sorted[0].date = createdAt;
  }
  return sorted;
};

// Route to retrieve cards associated with the logged-in user
router.get('/analytics', authenticateToken, async (req, res) => {
  try {
    // Get the user ID from the authenticated token
    const userId = req.user.userId;
    console.log('Authenticated user ID:', userId);

    // Aggregate data for different fields belonging to the user
    const backlogTasks = await Card.countDocuments({ createdBy: userId, tag: 'Backlog' });
    const lowPriorityTasks = await Card.countDocuments({ createdBy: userId, priorityText: 'Low Priority' });
    const todoTasks = await Card.countDocuments({ createdBy: userId, tag: 'Todo' });
    const moderatePriorityTasks = await Card.countDocuments({
      createdBy: userId,
      priorityText: { $in: ['Moderate Priority', 'Medium Priority'] }
    });
    const inProgressTasks = await Card.countDocuments({ createdBy: userId, tag: 'In Progress' });
    const highPriorityTasks = await Card.countDocuments({ createdBy: userId, priorityText: 'High Priority' });
    const completedTasks = await Card.countDocuments({ createdBy: userId, tag: 'Done' });
    const dueDateTasks = await Card.countDocuments({ createdBy: userId, dueDate: { $exists: true } });
    console.log(todoTasks);

    // Return aggregated data
    res.json({
      backlogTasks,
      lowPriorityTasks,
      todoTasks,
      moderatePriorityTasks,
      inProgressTasks,
      highPriorityTasks,
      completedTasks,
      dueDateTasks
    });
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    res.status(500).json({ error: 'Error fetching analytics data' });
  }
});

router.get('/flow-metrics', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const cards = await Card.find({ createdBy: userId });
    const now = new Date();

    const metrics = {
      stuckCount: 0,
      avgAgingWipDays: 0,
      avgCycleTimeDays: 0,
      throughput7d: 0,
      stuckByStatus: {
        Backlog: 0,
        Todo: 0,
        'In Progress': 0,
      },
      bottleneckDays: BOTTLENECK_DAYS,
    };

    if (cards.length === 0) {
      return res.json(metrics);
    }

    let activeCount = 0;
    let completedCount = 0;
    let totalActiveAging = 0;
    let totalCycleTime = 0;

    cards.forEach((card) => {
      const createdAt = card.createdAt ? new Date(card.createdAt) : now;
      const history = normalizeHistory(card, createdAt);
      const isDone = card.tag === 'Done';
      let doneDate = null;
      let currentSegmentDuration = 0;

      for (let i = 0; i < history.length; i += 1) {
        const current = history[i];
        const next = history[i + 1];
        const startDate = current.date;
        const endDate = next ? next.date : isDone && current.status === 'Done' ? startDate : now;
        const durationDays = diffInDays(startDate, endDate);

        if (current.status === 'Done') {
          doneDate = endDate;
        }

        const isLastSegment = i === history.length - 1;
        if (!isDone && isLastSegment) {
          currentSegmentDuration = durationDays;
          totalActiveAging += currentSegmentDuration;
          activeCount += 1;
          if (durationDays > BOTTLENECK_DAYS && current.status !== 'Done') {
            metrics.stuckCount += 1;
            if (metrics.stuckByStatus[current.status] !== undefined) {
              metrics.stuckByStatus[current.status] += 1;
            }
          }
        }
      }

      if (doneDate) {
        completedCount += 1;
        totalCycleTime += diffInDays(createdAt, doneDate);
        if (diffInDays(doneDate, now) <= 7) {
          metrics.throughput7d += 1;
        }
      }
    });

    metrics.avgAgingWipDays = activeCount > 0 ? Math.round(totalActiveAging / activeCount) : 0;
    metrics.avgCycleTimeDays = completedCount > 0 ? Math.round(totalCycleTime / completedCount) : 0;

    return res.json(metrics);
  } catch (error) {
    console.error('Error fetching flow metrics:', error);
    return res.status(500).json({ error: 'Error fetching flow metrics' });
  }
});

router.get('/getcards', authenticateToken, async (req, res) => {
  try {
    // Extract userID from the authenticated token
    const userID = req.user.userId;
    console.log("Backend userID: ", userID);

    // Retrieve cards created by the logged-in user
    const userCards = await Card.find({ createdBy: userID });

    // Filter the cards based on their tags
    const filteredBoards = [
      { title: 'Backlog', tag: 'Backlog', cards: [] },
      { title: 'Todo', tag: 'Todo', cards: [] },
      { title: 'In Progress', tag: 'In Progress', cards: [] },
      { title: 'Done', tag: 'Done', cards: [] },
    ];

    userCards.forEach(card => {
      const boardIndex = filteredBoards.findIndex(board => board.tag === card.tag);
      if (boardIndex !== -1) {
        filteredBoards[boardIndex].cards.push(card);
      }
    });

    res.json({ boards: filteredBoards });
  } catch (error) {
    console.error('Error retrieving user cards:', error);
    res.status(500).json({ error: 'Error retrieving user cards' });
  }
});

router.post('/createcards', authenticateToken, async (req, res) => {
    try {
      const { title, priorityColor, priorityText, checklists, dueDate, tag } = req.body;
      const createdBy = req.user.userId; // Get user ID from authenticated token
      
      // Process checklists to add timestamps for new items
      const processedChecklists = (checklists || []).map(checklist => {
        const now = new Date();
        return {
          ...checklist,
          createdAt: checklist.createdAt ? new Date(checklist.createdAt) : now,
          lastModified: now,
          activityHistory: checklist.activityHistory || [{
            date: now,
            action: 'created'
          }]
        };
      });
  
      // Create a new card object
      const now = new Date();
      const newCard = new Card({
        title,
        priorityColor,
        priorityText,
        checklists: processedChecklists,
        dueDate,
        tag,
        createdAt: now,
        statusHistory: [{
          status: tag || 'Todo',
          date: now
        }],
        createdBy // Link the card to the authenticated user
      });
  
      // Save the new card to the database
      const savedCard = await newCard.save();
  
      res.status(201).json(savedCard);
    } catch (error) {
      console.error('Error creating new card:', error);
      res.status(500).json({ error: 'Error creating new card' });
    }
});

router.put('/updatetag/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { tag } = req.body;
  const userId = req.user.userId;

  try {
    // Find the card by ID, verify ownership, and update its tag
    const card = await Card.findOne({ _id: id, createdBy: userId });
    if (!card) {
      return res.status(404).json({ error: 'Card not found or access denied' });
    }

    // Track status change in history
    const now = new Date();
    const statusHistory = card.statusHistory || [];
    
    // Only add to history if status actually changed
    if (card.tag !== tag) {
      statusHistory.push({
        status: tag,
        date: now
      });
    }

    const updatedCard = await Card.findByIdAndUpdate(
      id, 
      { tag, statusHistory }, 
      { new: true }
    );
    res.json(updatedCard);
  } catch (error) {
    console.error('Error updating card tag:', error);
    res.status(500).json({ error: 'Failed to update card tag' });
  }
});

router.put('/editcards/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, priorityColor, priorityText, checklists, dueDate, tag } = req.body;
    const userId = req.user.userId;

    // Find the card by ID, verify ownership, and update it
    const card = await Card.findOne({ _id: id, createdBy: userId });
    if (!card) {
      return res.status(404).json({ error: 'Card not found or access denied' });
    }

    // Process checklists to track modifications
    const now = new Date();
    const processedChecklists = (checklists || []).map((newChecklist, index) => {
      const existingChecklist = card.checklists[index];
      
      // If checklist exists, check for changes
      if (existingChecklist) {
        const activityHistory = existingChecklist.activityHistory || [];
        const changes = [];
        
        // Check if title changed
        if (newChecklist.title !== existingChecklist.title) {
          changes.push({ date: now, action: 'modified' });
        }
        
        // Check if completed status changed
        if (newChecklist.completed !== existingChecklist.completed) {
          changes.push({ 
            date: now, 
            action: newChecklist.completed ? 'checked' : 'unchecked' 
          });
        }
        
        return {
          ...newChecklist,
          createdAt: existingChecklist.createdAt || now,
          lastModified: changes.length > 0 ? now : existingChecklist.lastModified,
          activityHistory: [...activityHistory, ...changes]
        };
      } else {
        // New checklist item
        return {
          ...newChecklist,
          createdAt: newChecklist.createdAt ? new Date(newChecklist.createdAt) : now,
          lastModified: now,
          activityHistory: [{
            date: now,
            action: 'created'
          }]
        };
      }
    });

    // Track status change in history if tag changed
    let statusHistory = card.statusHistory || [];
    if (tag && card.tag !== tag) {
      statusHistory.push({
        status: tag,
        date: now
      });
    }

    const updatedCard = await Card.findByIdAndUpdate(
      id,
      {
        title,
        priorityColor,
        priorityText,
        checklists: processedChecklists,
        dueDate,
        tag,
        statusHistory
      },
      { new: true }
    );

    res.status(200).json(updatedCard);
  } catch (error) {
    console.error('Error updating card:', error);
    res.status(500).json({ error: 'Error updating card' });
  }
});

router.put('/updateChecklistItem/:cardId', authenticateToken, async (req, res) => {
  const cardId = req.params.cardId;
  const updatedChecklistItems = req.body.checklistItems;
  const userId = req.user.userId;

  try {
    // Find the card by ID, verify ownership, and update the checklist items
    const card = await Card.findOne({ _id: cardId, createdBy: userId });
    if (!card) {
      return res.status(404).json({ error: 'Card not found or access denied' });
    }

    // Process checklist items to track activity
    const now = new Date();
    const processedChecklists = updatedChecklistItems.map((newItem, index) => {
      const existingItem = card.checklists[index];
      
      if (existingItem) {
        const activityHistory = existingItem.activityHistory || [];
        const changes = [];
        
        // Check if completed status changed
        if (newItem.completed !== existingItem.completed) {
          changes.push({ 
            date: now, 
            action: newItem.completed ? 'checked' : 'unchecked' 
          });
        }
        
        // Check if title changed
        if (newItem.title !== existingItem.title) {
          changes.push({ date: now, action: 'modified' });
        }
        
        return {
          ...newItem,
          createdAt: existingItem.createdAt || now,
          lastModified: changes.length > 0 ? now : existingItem.lastModified,
          activityHistory: changes.length > 0 ? [...activityHistory, ...changes] : activityHistory
        };
      } else {
        // New item (shouldn't happen in this route, but handle it)
        return {
          ...newItem,
          createdAt: now,
          lastModified: now,
          activityHistory: [{
            date: now,
            action: 'created'
          }]
        };
      }
    });

    const updatedCard = await Card.findByIdAndUpdate(
      cardId, 
      { checklists: processedChecklists }, 
      { new: true }
    );

    res.status(200).json({ message: 'Checklist items updated successfully', card: updatedCard });
  } catch (error) {
    console.error('Error updating checklist items:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE route to delete a card
router.delete('/deleteCard/:id', authenticateToken, async (req, res) => {
  try {
    const cardId = req.params.id;
    const userId = req.user.userId;

    // Find the card by ID, verify ownership, and delete it
    const card = await Card.findOne({ _id: cardId, createdBy: userId });
    if (!card) {
      return res.status(404).json({ error: 'Card not found or access denied' });
    }

    const deletedCard = await Card.findByIdAndDelete(cardId);
    res.json({ message: 'Card deleted successfully' });
  } catch (error) {
    console.error('Error deleting card:', error);
    res.status(500).json({ error: 'Error deleting card' });
  }
});

// Public route - no authentication required
router.get('/publiccard/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const card = await Card.findById(id);
    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }
    res.json(card);
  } catch (error) {
    console.error('Error fetching card:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
