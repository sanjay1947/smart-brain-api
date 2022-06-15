// And when you want to run the project locally, 
// just run in your terminal npm start:dev and it will load fileName.js with nodemon.

// While in Heroku, npm start runs by default and loads fileName.js from a normal 
// node command and you get rid of that error.


const express = require('express');
const bodyParser = require('body-parser'); // most commonly used middleware
const bcrypt = require('bcrypt-nodejs'); // library for hashing password /// eg argon2, scrypt, or bcrypt
const cors = require('cors'); // important concept in web security for accessing data of website.
const knex = require('knex');

const register = require('./controllers/register')
const signin = require('./controllers/signin')
const profile = require('./controllers/profile')
const image = require('./controllers/image')

// for connection with database
const db = knex({
	client: 'pg',
	connection: {
		// host : 'postgresql-cubed-07657',
		// user : 'postgres',
		// password : 'admin',
		// database: 'smart-brain'
        host : process.env.DATABASE_URL,
        ssl: true,
	}
});


const app = express();


// used after app variable
// IN express there is an error if we dont include body-parser 
// Error : Cannot read properties of undefined (reading 'email')
// reason is that parsing is not done, so we use middleware
app.use(cors());
app.use(bodyParser.json());


// after deploying
// app.get('/', (req, res)=> {	res.send(database.users)})
app.get('/', (req, res)=> { res.send('wroking')})

app.post('/signin', signin.handleSignin(db, bcrypt))

// register.handleRegister will get the request and response
app.post('/register', (req, res) => {register.handleRegister(req, res, db, bcrypt)})

// :id means we can now enter profile/1255 so we can grab this id 
// using request.params
app.get('/profile/:id', (req, res) => {profile.handleProfileGet(req, res, db)})

app.put('/image', (req, res) => {image.handleImage(req, res, db)})

app.post('/imageurl', (req, res) => {image.handleApiCall(req, res)})

// bcrypt.hash("bacon", null, null, function(err, hash) {
//     // Store hash in your password DB.
// });

// // Load hash from your password DB.
// bcrypt.compare("bacon", hash, function(err, res) {
//     // res == true
// });
// bcrypt.compare("veggies", hash, function(err, res) {
//     // res = false
// });

// to run port as per environment
 app.listen(process.env.PORT || 3000, ()=> {
  
 	console.log(`app running smoothly on port ${process.env.PORT}`);
 })

/* 
 ---- idea of what all might be Needed ----
 --> res = this is working
 /signin --> POST = return success/fail
 /register --> POST = user
 /profile/:userId --> GET = user (user information)
 /image --> PUT --> user (ranking count of photos i..e submission of photos)

*/

/*
const express = require('express');
const bodyParser = require('body-parser'); // latest version of exressJS now comes with Body-Parser!
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex')

const db = knex({
  // Enter your own database information here based on what you created
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : 'postgres',
    password : 'admin',
    database: 'smart-brain'
  }
});

const app = express();

app.use(cors())
app.use(express.json()); // latest version of exressJS now comes with Body-Parser!


app.get('/', (req, res)=> {
  res.send(database.users);
})

app.post('/signin', (req, res) => {
  db.select('email', 'hash').from('login')
    .where('email', '=', req.body.email)
    .then(data => {
      const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
      if (isValid) {
        return db.select('*').from('users')
          .where('email', '=', req.body.email)
          .then(user => {
            res.json(user[0])
          })
          .catch(err => res.status(400).json('unable to get user'))
      } else {
        res.status(400).json('wrong credentials')
      }
    })
    .catch(err => res.status(400).json('wrong credentials'))
})

app.post('/register', (req, res) => {
  const { email, name, password } = req.body;
  const hash = bcrypt.hashSync(password);
    db.transaction(trx => {
      trx.insert({
        hash: hash,
        email: email
      })
      .into('login')
      .returning('email')
      .then(loginEmail => {
        return trx('users')
          .returning('*')
          .insert({
            // If you are using knex.js version 1.0.0 or higher this now returns an array of objects. Therefore, the code goes from:
            // loginEmail[0] --> this used to return the email
            // TO
            // loginEmail[0].email --> this now returns the email
            email: loginEmail[0].email,
            name: name,
            joined: new Date()
          })
          .then(user => {
            res.json(user[0]);
          })
      })
      .then(trx.commit)
      .catch(trx.rollback)
    })
    .catch(err => res.status(400).json('unable to register'))
})

app.get('/profile/:id', (req, res) => {
  const { id } = req.params;
  db.select('*').from('users').where({id})
    .then(user => {
      if (user.length) {
        res.json(user[0])
      } else {
        res.status(400).json('Not found')
      }
    })
    .catch(err => res.status(400).json('error getting user'))
})

app.put('/image', (req, res) => {
  const { id } = req.body;
  db('users').where('id', '=', id)
  .increment('entries', 1)
  .returning('entries')
  .then(entries => {
    // If you are using knex.js version 1.0.0 or higher this now returns an array of objects. Therefore, the code goes from:
    // entries[0] --> this used to return the entries
    // TO
    // entries[0].entries --> this now returns the entries
    res.json(entries[0].entries);
  })
  .catch(err => res.status(400).json('unable to get entries'))
})

app.listen(3000, ()=> {
  console.log('app is running on port 3000');
})

*/