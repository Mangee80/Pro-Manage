const express = require('express');
const router = express.Router();
const Card = require('../Models/cards');

// Route to retrieve cards associated with the logged-in user

router.get('/analytics', async (req, res) => {
  try {
    // Get the user ID from the request query parameters
    const userId = req.query.userID;
    console.log(userId);

    // Aggregate data for different fields belonging to the user
    const backlogTasks = await Card.countDocuments({ createdBy: userId, tag: 'Backlog' });
    const lowPriorityTasks = await Card.countDocuments({ createdBy: userId, priorityText: 'Low Priority' });
    const todoTasks = await Card.countDocuments({ createdBy: userId, tag: 'Todo' });
    const moderatePriorityTasks = await Card.countDocuments({ createdBy: userId, priorityText: 'Moderate Priority' });
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




router.get('/getcards', async (req, res) => {
  try {
    // Extract userID from the request query parameters
    const userID = req.query.userID;
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



router.post('/createcards', async (req, res) => {
    try {
      const { title, priorityColor, priorityText, checklists, dueDate, tag,  createdBy } = req.body;
      // const userId = window.localStorage.getItem('userID');
  
      // Create a new card object
      const newCard = new Card({
        title,
        priorityColor,
        priorityText,
        checklists,
        dueDate,
        tag,
        createdBy // Link the card to the user who created it
      });
  
      // Save the new card to the database
      const savedCard = await newCard.save();
  
      res.status(201).json(savedCard);
    } catch (error) {
      console.error('Error creating new card:', error);
      res.status(500).json({ error: 'Error creating new card' });
    }
});




router.put('/updatetag/:id', async (req, res) => {
  const { id } = req.params;
  const { tag } = req.body;

  try {
    // Find the card by ID and update its tag
    const updatedCard = await Card.findByIdAndUpdate(id, { tag }, { new: true });
    res.json(updatedCard);
  } catch (error) {
    console.error('Error updating card tag:', error);
    res.status(500).json({ error: 'Failed to update card tag' });
  }
});


router.put('/editcards/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, priorityColor, priorityText, checklists, dueDate, tag } = req.body;

    // Find the card by ID and update it with the new data
    const updatedCard = await Card.findByIdAndUpdate(
      id,
      {
        title,
        priorityColor,
        priorityText,
        checklists,
        dueDate,
        tag
      },
      { new: true } // This option returns the updated document
    );

    if (!updatedCard) {
      return res.status(404).json({ error: 'Card not found' });
    }
    res.status(200).json(updatedCard);
  } catch (error) {
    console.error('Error updating card:', error);
    res.status(500).json({ error: 'Error updating card' });
  }
});


router.put('/updateChecklistItem/:cardId', async (req, res) => {
  const cardId = req.params.cardId;
  const updatedChecklistItems = req.body.checklistItems;

  try {
    // Find the card by ID and update the checklist items
    const updatedCard = await Card.findByIdAndUpdate(cardId, { checklists: updatedChecklistItems }, { new: true });

    if (updatedCard) {
      res.status(200).json({ message: 'Checklist items updated successfully', card: updatedCard });
    } else {
      res.status(404).json({ message: 'Card not found' });
    }
  } catch (error) {
    console.error('Error updating checklist items:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
// DELETE route to delete a card
router.delete('/deleteCard/:id', async (req, res) => {
  try {
    const cardId = req.params.id;
    // Find the card by its ID and delete it
    const deletedCard = await Card.findByIdAndDelete(cardId);
    if (!deletedCard) {
      return res.status(404).json({ error: 'Card not found' });
    }
    // Respond with a success message
    res.json({ message: 'Card deleted successfully' });
  } catch (error) {
    console.error('Error deleting card:', error);
    res.status(500).json({ error: 'Error deleting card' });
  }
});



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
