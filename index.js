require('dotenv').config()

const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const TOKEN_KEY = process.env.TOKEN_KEY

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
      const token = authHeader.split(' ')[1];
      jwt.verify(token, TOKEN_KEY, (err, user) => {
          if (err) {
              return res.sendStatus(403);
          }

          req.user = user;
          next();
      });
  } else {
      res.sendStatus(401);
  }
};

// Some users
const users = [
  {
    username: 'ali',
    password: 'ali',
    role: 'admin'
  },
  {
    username: 'herry',
    password: 'herry',
    role: 'user'
  }
];

const books = [
  {
      "author": "Chinua Achebe",
      "country": "Nigeria",
      "language": "English",
      "pages": 209,
      "title": "Things Fall Apart",
      "year": 1958
  },
  {
      "author": "Hans Christian Andersen",
      "country": "Denmark",
      "language": "Danish",
      "pages": 784,
      "title": "Fairy tales",
      "year": 1836
  },
  {
      "author": "Dante Alighieri",
      "country": "Italy",
      "language": "Italian",
      "pages": 928,
      "title": "The Divine Comedy",
      "year": 1315
  },
];

app.use(bodyParser.json());


app.get('/', (req, res) => res.send({ version: "1.0" }))

app.post('/login', (req, res) => {
  // Read username and password from request body
  const { username, password } = req.body;

  // Filter user from the users array by username and password
  const user = users.find(u => { return u.username === username && u.password === password });

  if (user) {
      // Generate an access token
      const accessToken = jwt.sign({ username: user.username,  role: user.role }, TOKEN_KEY);

      res.json({
          success: true,
          accessToken
      });
  } else {
      res.json({ success: false, error: "Username and password invalid" });
  }
});

app.get('/books', authenticateJWT, (req, res) => {
  res.json(books);
});

app.post('/books', authenticateJWT, (req, res) => {
  const { role } = req.user;

  if (role !== 'admin') {
      return res.sendStatus(403);
  }


  const book = req.body;
  books.push(book);

  res.send('Book added successfully');
});


app.listen(port, () => console.log(`Example app listening on port ${port}!`))