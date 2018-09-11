var restify = require('restify');
const Sequelize = require('sequelize');

const sequelize = new Sequelize('postgres', 'postgres', 'Sugmaseng', {
    host: 'localhost',
    dialect: 'postgres',
    define: {
      timestamps: false
    },
  
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
  
    // http://docs.sequelizejs.com/manual/tutorial/querying.html#operators
    operatorsAliases: false
  });

const Users = sequelize.import('./models/users');

function respond(req, res, next) {
  res.send('hello ' + req.params.name);
  next();
}

var server = restify.createServer();

server.use(restify.plugins.queryParser({
  mapParams: true
}));
server.use(restify.plugins.bodyParser({
  mapParams: true
}));
server.use(restify.plugins.acceptParser(server.acceptable));

server.get('/hello/:name', respond);
server.post('/login', function(req, res, next){
  const username = req.body.username
  const password = req.body.password
  const email    = req.body.email

  Users.find({
    where: {
      username: username
    }
  }).then(user => {
    if (user.password == password) {
      res.send(200, user.id);
    }
    res.send(400);

  });


});


server.post('/createAccount', function(req, res, next){
  const username = req.body.username
  const password = req.body.password
  const email    = req.body.email

  Users.create({username: username, password: password, email: email}).then(user => {
    res.send(200, user.id);
    return next();
  }).catch(error => {
    return res.send(400);
  })

  //
  

});

server.get('/subjects/:userid', function(req, res, next){


})
server.head('/hello/:name', respond);

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});