const express = require('express');
const multer = require('multer');
const mysql = require('mysql2');
const path = require('path');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 3000;

app.use(express.json());
require('dotenv').config();
// Configuration du stockage de l'image avec multer pour la photo de l'utilisateur
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
    },
  });
  const upload = multer({ storage: storage });
  app.use(cors());

// Configuration de la connexion MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    port: 3306
});

app.use(express.json());
// app.use(express.static('uploads'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//A ajouter dans index.js après la partie connexion à la base de donnée MySQL:

app.use(express.json());
// app.use(express.static('uploads'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route pour récupérer tous les posts
app.get('/api/posts', (req, res) => {
  const sql = `
    SELECT posts.id, posts.content, posts.like, posts.timestamp, users.pseudo, users.photo
    FROM posts
    JOIN users ON posts.user_id = users.id
    ORDER BY posts.timestamp DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des posts:', err);
      return res
        .status(500)
        .json({ error: 'Erreur lors de la récupération des posts' });
    }
    res.json(results);
  });
});

// Route pour ajouter un utilisateur avec photo et un post

app.post('/api/users', upload.single('photo'), (req, res) => {
  const pseudo = req.body.pseudo;
  const photoUrl = req.file ? req.file.filename : null;
  const content = req.body.content;
  const like = req.body.like || false;

  // Insertion de l'utilisateur dans la table users
  const userSql = 'INSERT INTO users (pseudo, photo) VALUES (?, ?)';
  db.query(userSql, [pseudo, photoUrl], (err, userResult) => {
    if (err) {
      console.error("Erreur lors de l'ajout de l'utilisateur:", err);
      return res
        .status(500)
        .json({ error: "Erreur lors de l'ajout de l'utilisateur" });
    }

    const userId = userResult.insertId;

    // Insertion du post dans la table posts en associant l'user_id
    const postSql =
      'INSERT INTO posts (user_id, content, `like`, timestamp) VALUES (?, ?, ?, NOW())';
    db.query(postSql, [userId, content, like], (err) => {
      if (err) {
        console.error("Erreur lors de l'ajout du post:", err);
        return res
          .status(500)
          .json({ error: "Erreur lors de l'ajout du post" });
      }

      // Retourner une réponse JSON valide si tout s'est bien passé
      res.json({
        message: 'Utilisateur et post ajoutés avec succès !',
        userId: userId,
      });
    });
  });
});

app.put('/api/posts/:id', (req, res) => {
  const postId = req.params.id;
  const newContent = req.body.content;

  const sql = 'UPDATE posts SET content = ? WHERE id = ?';
  db.query(sql, [newContent, postId], (err, result) => {
    if (err) {
      console.error('Erreur lors de la mise à jour du post:', err);
      return res
        .status(500)
        .json({ error: 'Erreur lors de la mise à jour du post' });
    }
    res.json({ message: 'Post mis à jour avec succès' });
  });
});

app.delete('/api/posts/:id', (req, res) => {
  const postId = req.params.id;

  const sql = 'DELETE FROM posts WHERE id = ?';
  db.query(sql, [postId], (err, result) => {
    if (err) {
      console.error('Erreur lors de la suppression du post:', err);
      return res
        .status(500)
        .json({ error: 'Erreur lors de la suppression du post' });
    }
    res.json({ message: 'Post supprimé avec succès' });
  });
});

app.put('/api/posts/:id/like', (req, res) => {
  const postId = req.params.id;
  const likeStatus = req.body.like;

  const sql = 'UPDATE posts SET `like` = ? WHERE id = ?';
  db.query(sql, [likeStatus, postId], (err, result) => {
    if (err) {
      console.error('Erreur lors de la mise à jour du like:', err);
      return res
        .status(500)
        .json({ error: 'Erreur lors de la mise à jour du like' });
    }
    res.json({ message: 'Statut du like mis à jour avec succès' });
  });
});

app.listen(port, () => {
  console.log(`Serveur lancé sur http://localhost:${port}`);
});