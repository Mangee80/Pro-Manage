const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const authRoutes = require('./Routes/authRoutes');
const cardRoutes = require('./Routes/cardRoutes');
const app = express();
app.use(cors());
dotenv.config();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.use('/api/auth', authRoutes);
app.use('/api/card', cardRoutes);

mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("MongoDB Connected");
})
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err);
});

app.use("/", async (req, res) => {
  res.status(200).json("Server is up and Running")
});
app.get('/health', (req, res) => {
  res.json({
      serverName: 'Job List Server',
      currentTime: new Date().toLocaleTimeString(),
      state: 'active'
  })
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
})
const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});