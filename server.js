var restify = require('restify');
const Sequelize = require('sequelize');
const corsMiddleware = require('restify-cors-middleware');
var moment = require('moment');

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
const Tasks = sequelize.import('./models/tasks');

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
  const username = req.body.username;
  const password = req.body.password;
  const email    = req.body.email;


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
  }).then(async subjects => {
    var new_subjects = [];
    
    for (var i = 0; i < subjects.length; i++) {
      let marks =  await getTotals(subjects[i].id);
      let subject = subjects[i];
      subject.total =  marks.total;
      subject.curr_total = marks.curr_total
      console.log(subject.total)
      new_subjects.push({id: subject.id, userid: subject.user_id, name: subject.name, goal_mark: subject.goal_mark, total: subject.total, curr_total: subject.curr_total});
    }
    
    await res.send(200, new_subjects);
    return next();
  }).catch(error => {
    res.send(400, error);
    return next();
  });
});

async function getTotals(id) {
  
  var total = 0;
  var curr_total = 0;
  let pls = await Assessments.findAll({
      where: {
        subject_id: id
      }
    }).then(assess => {
        assess.forEach((assessment) => {
          const asses_actual = assessment.actual_mark / assessment.total_mark;
          const asses_total = asses_actual * assessment.weight;
          total += assessment.weight;
          curr_total += asses_total;
        })
    })

    return {total, curr_total};
}

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

server.post('/tasks', function(req, res, next){
  const user_id = req.body.user_id;
  const task_description = req.body.task_description;
  const complete = req.body.complete;
  const due_date = moment(req.body.due_date, 'DD/MM/YYYY').toString();

  Tasks.create({user_id, task_description, complete, due_date}).then(task => {
    res.send(201, task.id);
    return next();
  }).catch(error => {
    res.send(400, error);
    return next();
  });
});

server.put('/tasks', function(req, res, next){
  const id = req.body.id;
  const task_description = req.body.task_description;
  const complete = req.body.complete;
  const due_date = moment(req.body.due_date, 'DD/MM/YYYY').toString();

  Tasks.update({task_description, complete, due_date}, {where: {id}}).then(task => {
    res.send(200, task.id);
    return next();
  }).catch(error => {
    res.send(400, error);
    return next();
  });
});

server.get('/tasks/:user_id', function(req, res, next){
  const user_id = req.params.user_id;
  Tasks.findAll({
    where: {
      user_id: user_id
    }
  }).then(tasks => {
    res.send(200, tasks);
    return next();
  }).catch(error => {
    res.send(400, error);
    return next();
  });
});

server.del('/tasks/:id', function(req, res, next){
  const id = req.params.id;

  Tasks.destroy({
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


server.listen(8081, function() {
  console.log('%s listening at %s', server.name, server.url);
});
