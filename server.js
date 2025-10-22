require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { sequelize } = require('./src/models');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', require('./src/routes'));

app.get('/', (req, res) => {
  res.send('BloodLink API is running!');
});

// Sync Sequelize models and start the server
sequelize.sync({ force: false }).then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch(error => {
  console.error('Unable to connect to the database:', error);
});
