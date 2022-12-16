/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import * as express from 'express';
import * as path from 'path';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';
import * as uuid from 'uuid';

import DummyDB from './app/dummyDb';

const db = new DummyDB();
const app = express();
app.use(cors());
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(
  bodyParser.urlencoded({
    // to support URL-encoded bodies
    extended: true,
  })
);

function getUserBySessionToken(token: string): any {
  const key = Object.keys(db.data).find((userKey: string) => {
    const user = db.data[userKey];
    if (user.sessions.includes(token)) {
      return user;
    }
  });

  if (key) {
    return [key, db.data[key]];
  } else {
    throw new Error('Invalid token!');
  }
}

app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.post('/api/verify', (req, res) => {
  const { token } = req.body;
  Object.keys(db.data).find((userKey: string) => {
    const user = db.data[userKey];
    if (user.sessions.includes(token)) {
      res
        .status(200)
        .send(JSON.stringify({ email: userKey, ...user, password: undefined }));
    }
  });

  res.status(401).send({ message: 'Invalid token!' });
});

app.post('/api/submit', (req, res) => {
  const { token } = req.headers;
  const { body } = req;

  if (token && body) {
    const [user, userData] = getUserBySessionToken(token as string);
    if (!user) {
      res.status(401).send({ message: 'Invalid token!' });
    }
    // db.data[user].data.append(body);
    const data = db.data[user].data || [];
    data.push(body);
    db.data[user].data = data;
    db.syncDB();
    res.status(200).send();
  } else {
    res.status(400).send({ message: 'Token and body are required!' });
  }
});

app.delete('/api/item/:id', (req, res) => {
  const { token } = req.headers;
  const { id } = req.params;
  if (token && id) {
    const [user, userData] = getUserBySessionToken(token as string);
    if (!user) {
      res.status(401).send({ message: 'Invalid token!' });
    }
    console.log(user, id)
    db.data[user].data = db.data[user].data.filter(item => item.key !== parseInt(id));
    console.log(db.data[user])
    db.syncDB();
    res.status(200).send();
  } else {
    res.status(400).send({ message: 'Token and body are required!' });
  }
});

app.post('/api/logout', (req, res) => {
  const { token } = req.headers;

  if (token) {
    const [_, user] = getUserBySessionToken(token as string);
    user.sessions = user.sessions.filter(
      (session: string) => session !== token
    );
    
    db.syncDB();
    res.status(200).send();
  } else {
    res.status(400).send({ message: 'Invalid Token' });
  }
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  // res.send({ message: 'Welcome to sample-server!' });
  if (!email || !password) {
    res.status(400).send({ message: 'Email and password are required!' });
  }

  const user = db.getUser(email);

  if (!user || user.password !== password) {
    res.status(401).send({ message: 'User not found or password incorrect!' });
  }

  if (user) {
    const sessions = user.sessions || [];
    const sessionId = uuid.v4();
    sessions.push(sessionId);
    user.sessions = sessions;
    db.syncDB();
    res.status(200).send({ sessionId });
  }
});

app.get('/api', (req, res) => {
  res.send({ message: 'Welcome to sample-server!' });
});

const port = process.env.port || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
