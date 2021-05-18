const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

var {Club} = require('./../models/club');

var generateAuthToken = (user) => {
  var user = user;
  var access = 'auth';
  var token = jwt.sign({_id: user._id.toHexString(), access}, 'abc123').toString();

  user.tokens = user.tokens.concat({access, token});

  return Club.update(
    {name: user.name},
    {$addToSet: {tokens: {access, token}}}).then((club) => {
    console.log('Club updated: ', token);
    return token;
  }).catch(e => console.log('Error while updating club: ', e));
};

var authenticate = (req, res, next) => {
  var user1 = {
    name: req.body.name,
    password: req.body.password
  };
  return Club.findOne({name: user1.name}).then((user) => {
    return bcrypt.compare(user1.password, user.password, (err, res) => {
      return generateAuthToken(user).then(token => {
        console.log('Token: ' ,token);
        if(res) {
          req.token = token;
          req.user = user;
          return next();
        } else {
          return Promise.reject();
        }
      });
    });
  }).catch((e) => {
    console.log(`Authenticate middleware Error: ${e}`);
    res.sendStatus(401);
  });
};

module.exports = {authenticate};
