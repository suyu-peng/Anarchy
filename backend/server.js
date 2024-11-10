const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(bodyParser.json());

// PostgreSQL client
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Heroku or Render will set this automatically
});

// Create post
app.post('/post', async (req, res) => {
  const { content, board } = req.body;
  
  try {
    const newPost = await pool.query(
      'INSERT INTO posts (content, board) VALUES ($1, $2) RETURNING *',
      [content, board]
    );
    res.status(201).json(newPost.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get posts by board
app.get('/board/:board', async (req, res) => {
  const { board } = req.params;

  try {
    const posts = await pool.query(
      'SELECT * FROM posts WHERE board = $1 ORDER BY created_at DESC',
      [board]
    );
    res.json(posts.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
