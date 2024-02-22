// const express = require('express');
// const mongoose = require('mongoose');
 
// const bodyParser = require('body-parser');
// const cors = require('cors');

// const app = express();
 
// app.use(cors());
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());




// app.listen(process.env.PORT, () => {
//     mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
//       .then(() =>  console.log(`Server running on http://localhost:${process.env.PORT}`))
//       .catch((error) => console.log(error))
// });

// const express = require('express');
// const cors = require('cors');
// const dotenv = require('dotenv');
// const mongoose = require('mongoose');
// const bodyParser = require('body-parser');
// const Question = require('./models/quiz');
// const app = express();
// app.use(cors());
// dotenv.config();


// // Connect to MongoDB

// // Parse incoming request bodies in a middleware before your handlers
// app.use(bodyParser.json());

// // Define a route for handling form submissions
// app.post('/test', async (req, res) => {
//   try {
    
    
//     const { questionText, options, type } = req.body;

//     // Create a new Question instance with the form data
//     const newQuestion = new Question({
//       questionText,
//       options,
//       type
//     });

//     // Save the question to the database
//     await newQuestion.save()
//       .then((result) => {
//         console.log('Question saved:', result);
//         res.json({ message: 'Question saved successfully!' });
//       })
//       .catch((error) => {
//         console.error('Error saving question:', error);
//         res.status(500).json({ error: 'Error saving question' });
//       });

//   } catch (error) {
//     console.error('Unhandled error:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });


// app.listen(process.env.PORT, () => {
//   mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
//     .then(() => console.log(`Server running on http://localhost:${process.env.PORT}`))
//     .catch((error) => console.log(error))
// });
// Assuming your question schema is in the 'models/quiz.js' file
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Question = require('./models/quiz');
const app = express();
app.use(cors());
dotenv.config();

// Parse incoming request bodies in a middleware before your handlers
app.use(bodyParser.json());

// Define a route for handling form submissions
app.post('/test', async (req, res) => {
  try {
    const { questionText, options, type, answer } = req.body;

    // Create a new Question instance with the form data
    const newQuestion = new Question({
      questionText,
      options,
      type,
      answer
    });

    // Save the question to the database
    const result = await newQuestion.save();
    console.log('Question saved:', result);
    res.json({ message: 'Question saved successfully!' });

  } catch (error) {
    console.error('Error saving question:', error);
    res.status(500).json({ error: 'Error saving question' });
  }
});

app.listen(process.env.PORT, () => {
  mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log(`Server running on http://localhost:${process.env.PORT}`))
    .catch((error) => console.log(error))
});
