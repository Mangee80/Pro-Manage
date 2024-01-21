const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
dotenv.config();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());




app.listen(process.env.PORT, () => {
    mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
      .then(() =>  console.log(`Server running on http://localhost:${process.env.PORT}`))
      .catch((error) => console.log(error))
});