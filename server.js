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
const Subjects = sequelize.import('./models/subjects');

var server = restify.createServer();

server.use(restify.plugins.queryParser({
  mapParams: true
}));
server.use(restify.plugins.bodyParser({
  mapParams: true
}));
server.use(restify.plugins.acceptParser(server.acceptable));

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
      return next();
    } else {
      res.send(400);
      return next();
    }
  }).catch(error => {
    res.send(400);
    return next();
  });


});


server.post('/createAccount', function(req, res, next){
  const username = req.body.username
  const password = req.body.password
  const email    = req.body.email

  Users.create({username: username, password: password, email: email}).then(user => {
    res.send(201, user.id);
    return next();
  }).catch(error => {
    res.send(400);
    return next();
  });

});

server.get('/subjects/:user_id', function(req, res, next){
  const user_id = req.params.user_id;
  Subjects.findAll({
    where: {
      user_id: user_id
    }
  }).then(subjects => {
    res.send(200, subjects);
    return next();
  }).catch(error => {
    res.send(400, error);
    return next();
  });
});

server.post('/subjects', function(req, res, next){
  const user_id = req.body.user_id;
  const name = req.body.name;
  const goal_mark = req.body.goal_mark;

  Subjects.create({user_id: user_id, name: name, goal_mark: goal_mark}).then(subject => {
    res.send(201, subject.id);
    return next();
  }).catch(error => {
    res.send(400, error);
    return next();
  })
});

server.put('/subjects', function(req, res, next){
  const id = req.body.id;
  //const user_id = req.body.user_id;
  const name = req.body.name;
  const goal_mark = req.body.goal_mark;

  Subjects.update({
    name: name,
    goal_mark: goal_mark
  },{
    where: { id: id }
  }).then(subject => {
    res.send(200, subject);
    return next();
  }).catch(error => {
    res.send(400, error);
    return next();
  })
});

server.del('/subjects/:id', function(req, res, next){
  const id = req.params.id;

  Subjects.destroy({
    where: {
      id: id
    }
  }).then(() => {
    res.send(200);
    return next();
  }).catch(() => {
    res.send(200);
    return next();
  })
});

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});