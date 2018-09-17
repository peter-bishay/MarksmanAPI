var restify = require('restify');
const Sequelize = require('sequelize');
const corsMiddleware = require('restify-cors-middleware');

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

const cors = corsMiddleware({
  origins: ['*'],
  allowHeaders: ['*'],
  exposeHeaders: ['*']
});  

const Users = sequelize.import('./models/users');
const Subjects = sequelize.import('./models/subjects');
const Assessments = sequelize.import('./models/assessments');

var server = restify.createServer();

server.use(restify.plugins.queryParser({
  mapParams: true
}));
server.use(restify.plugins.bodyParser({
  mapParams: true
}));
server.use(restify.plugins.acceptParser(server.acceptable));

server.pre(cors.preflight);
server.use(cors.actual);


server.post('/login', function(req, res, next){
  const json = JSON.parse(req.body);
  const username = json.username;
  const password = json.password;
  const email    = json.email;


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
    res.send(400, "error");
    return next();
  });


});


server.post('/createAccount', function(req, res, next){
  const username = req.body.username
  const password = req.body.password
  const email    = req.body.email

  Users.create({username: username, password: password, email: email}).then(user => {
    res.send(201, "id:" + " " + user.id);
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

server.get('/assessments/:subject_id', function(req, res, next){
  const subject_id = req.params.subject_id;
  Assessments.findAll({
    where: {
      subject_id: subject_id
    }
  }).then(assessments => {
    res.send(200, assessments);
    return next();
  }).catch(error => {
    res.send(400, error);
    return next();
  });
});

server.post('/assessments', function(req, res, next){
  const subject_id = req.body.subject_id;
  const name = req.body.name;
  const total_mark = req.body.total_mark;
  const actual_mark = req.body.actual_mark;
  const goal_mark = req.body.goal_mark;
  const weight = req.body.weight;

  Assessments.create({subject_id: subject_id, name: name, total_mark: total_mark, 
  actual_mark: actual_mark, goal_mark: goal_mark, weight: weight}).then(assessment => {
    res.send(201, assessment.id);
    return next();
  }).catch(error => {
    res.send(400, error);
    return next();
  })
});

server.put('/assessments', function(req, res, next){
  const id = req.body.id;
  //const user_id = req.body.user_id;
  const name = req.body.name;
  const goal_mark = req.body.goal_mark;
  const weight = req.body.weight;
  const total_mark = req.body.total_mark;
  const actual_mark = req.body.actual_mark;

  Assessments.update({
    name: name,
    goal_mark: goal_mark,
    weight: weight,
    total_mark: total_mark,
    actual_mark: actual_mark
  },{
    where: { id: id }
  }).then(assessment => {
    res.send(200, assessment);
    return next();
  }).catch(error => {
    res.send(400, error);
    return next();
  })
});

server.del('/assessments/:id', function(req, res, next){
  const id = req.params.id;

  Assessments.destroy({
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

// Calculate total current mark out of the total as a percentage, returns current total and total
server.get('/subjects/totals/:subject_id', function (req, res, next){
  const subject_id = req.params.subject_id;

  total = 0; // Should add to 100 when all assessments added
  curr_total = 0; // Actual total out of 100

  Assessments.findAll({
    where: {
      subject_id: subject_id
    }
  }).then(assess => {
      assess.forEach(assessment => {
        const asses_actual = assessment.actual_mark / assessment.total_mark;
        // console.log(asses_actual);
        const asses_total = asses_actual * assessment.weight;
        // console.log(asses_total);
        total += assessment.weight;
        // console.log(total);
        curr_total += asses_total;
        // console.log(curr_total);
      })
      res.send(200, {total, curr_total})
  }).catch(error => {
    res.send(400);
  });

  
  return next();

});

server.listen(8081, function() {
  console.log('%s listening at %s', server.name, server.url);
});
