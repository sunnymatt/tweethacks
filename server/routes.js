/**
 * Main application routes
 */

'use strict';

import errors from './components/errors';
import path from 'path';
import passport from 'passport';

export default function (app) {
  let Twitter = require('twitter');
  //var TwitterStrategy = require('passport-twitter').Strategy;
  let watson = require('watson-developer-cloud');

  let twit = new Twitter({
    consumer_key: 'iq5MbK4YG0TcAICnyw9l7CUXf',
    consumer_secret: 'T08N6iJ8L2H0RP9KAoJ6IrpnHpnY8ADbRJOM2FWCP6tBRMyNCH',
    access_token_key: '354089015-QkVdLx1wNGRsEeNYMk0i3ANkQp9hgwc9mlxLdpRu',
    access_token_secret: 'xSzlyhKtkc7fhI07mSeOzax8AJ7UkFSsELQintlSApA0F'
  });

  var alchemy_language = watson.alchemy_language({
    api_key: 'e78c1e21b8baef3417e2fecd92d747e513d0ded6'
  })

  let LinearRegression = require('shaman').LinearRegression;

  let numTweets = 20;

  // Insert routes below
  app.use('/api/things', require('./api/thing'));
  app.use('/api/users', require('./api/user'));
  app.use('/api/twitter', require('./api/twitter'));

  app.use('/auth', require('./auth').default);


  //Returns a map of indeces to follower screen_names for every follower
  //of the name passed in the get request
  app.get('/followers/:name', function (req, response) {
    console.log(req.params.name)
    var x = {};
    twit.get('friends/list', {
        screen_name: req.params.name
      },
      function (error, followers, res) {
        if (!error) {
          for (var i in followers['users']) {
            x[followers['users'][i]['name']] = followers['users'][i]['screen_name'];
          }
        }
        response.status(200).send(x);
      });

  });

  //Pass in the name of the follower in the follower field of the header
  //Pass in the user id through the get request
  app.get('/screen_name_by_name/:userid/', function (req, response) {
    console.log(req.params.userid)
    var follower = req.headers.follower;
    var x = follower + " not found";
    twit.get('followers/list', {
        screen_name: req.params.userid
      },
      function (error, followers, res) {
        if (!error) {
          for (var i in followers['users']) {
            if (follower == followers['users'][i]['name']) {
              x = followers['users'][i]['screen_name'];
            }

          }
        }
        response.status(200).send(x);
      });
  });


  //Returns an object of screen names to an array of up to 20 tweets for 
  //All names passed in through the header
  app.get('/twitter', function (req, response) {
    let names = JSON.parse(req.headers.names);
    console.log(names);
    var all_tweets = {};

    var numFollowers = Object.keys(names).length;
    var numFollowersDone = 0;

    //Iterate over all the handles in the header
    for (var property in names) {
      let name = names[property];
      if(name.length === 1) continue;
      twit.get('statuses/user_timeline', {
          screen_name: name,
          count: numTweets
        },
        function (error, tweets, res) {
          var ind_tweets = {};
          if (error) {
            console.log("error with getting tweets")
          } else {
            for (var i in tweets) {
              ind_tweets[i] = tweets[i]['text']
            }
          }
          if (Object.keys(ind_tweets).length != 0) {
            all_tweets[name] = ind_tweets;
          }
          numFollowersDone++;

          if (numFollowers === numFollowersDone) {
            response.status(200).send(all_tweets);
          }
        });
    }
  });

  //analyze a map of indexes to tweets for the emotion specified in the get req
  app.post('/analyze/:emotion', function (req, response) {
    let tweets = JSON.parse(req.body.tweets);

    var scores = {};

    var numTweets = Object.keys(tweets).length;
    var numTweetsDone = 0;
    console.log(numTweets);
    console.log("done", numTweetsDone);

    //Iterate over all the handles in the header
    for (var property in tweets) {
      let tweet = tweets[property];
      let obj = {
        'text': tweet
      }
      let index = property;
      alchemy_language.emotion(obj, function (err, res) {
        if (err) {
          console.log('error with alchemy')
          numTweetsDone++;
          if (numTweets === numTweetsDone) {
            response.status(200).send(scores);
          }
        } else {
          scores[index] = res['docEmotions'][req.params.emotion];
          numTweetsDone++;
          if (numTweets === numTweetsDone) {
            response.status(200).send(scores);
          }
        }
      });
    }
  });

  //Takes in a vector of tweets to scores, starting with the newest tweet
  //Predicts the sadness of the next tweet
  app.get('/compute', function (req, response) {
    let scores = JSON.parse(req.headers.scores);

    var x = [];
    var y = [];
    var total = 0;
    for (var index in scores) {
      x.push(parseInt(index));
      y.push(parseFloat(scores[index]))
      total += parseFloat(scores[index]);
    }
    console.log("Len: ", x.length)
    var average = total / x.length
    console.log("Avg: ", average)

    var lr = new LinearRegression(x, y);

    lr.train(function (err) {
      if (err) {
        throw err;
      }
      var prediction = lr.predict(-1);
      if (prediction >= 1) prediction = 1;
      if (prediction <= 0) prediction = 0;
      console.log('Prediction is ', prediction, ' and avg is', average)
      prediction = Math.max(prediction, average)

      response.status(200).send(prediction.toString());
    });
  });

  app.get('/compute/anger', function (req, response) {
    let scores = JSON.parse(req.headers.scores);

    var numAngry = 0;

    var numScores = Object.keys(scores).length;
    var numTweetsDone = 0;

    //Iterate over all the handles in the header
    for (var property in scores) {
      if (scores[property] > 0.3) numAngry++;
    }

    var percent = numAngry / numScores;
    response.status(200).send(percent.toString());
  });

  //Get all mentions of any id in names (header)
  app.get('/mentions', function (req, res) {
    let names = JSON.parse(req.headers.names);

    var all_mentions = {};

    var numIDs = Object.keys(names).length;
    var numIDsDone = 0;

    //Iterate over all the handles in the header
    for (var property in names) {
      let userid = '@' + names[property];
      twit.get('search/tweets', {
          q: userid
        },
        function (error, tweets, response) {
          if (!error) {
            var mentions = {}
            console.log(tweets);
            for (var i in tweets['statuses']) {
              if (tweets['statuses'][i]['user']['screen_name'] != req.params.userid) {
                mentions[i] = tweets['statuses'][i]['text'];
              }
            }
            if (Object.keys(mentions).length !== 0) {
              all_mentions[userid] = mentions;
            }
            numIDsDone++;

            if (numIDsDone === numIDs) {
              res.status(200).send(all_mentions);
            }
          }
        });
    }
  });
  /*
  // TWITTER AUTH LOL
  passport.use('twitter', new TwitterStrategy({
    // Here we reference the values in env.js.
    consumerKey: 'iq5MbK4YG0TcAICnyw9l7CUXf',
    consumerSecret: 'T08N6iJ8L2H0RP9KAoJ6IrpnHpnY8ADbRJOM2FWCP6tBRMyNCH',
    callbackUrl: 'http://127.0.0.1:3000/auth/twitter/callback'
  }, function (token, secret, profile, done) {
    process.nextTick(function () {
      // If the user already exists, just return that user.
      return done(null, null);
    })
  }));

  app.get('/auth/twitter', passport.authenticate('twitter')); */

  app.get('/auth/twitter/callback',
    /*passport.authenticate('twitter', {
      failureRedirect: '/login'
    }),*/
    function (req, res) {
      // Successful authentication
      res.json(res);
    });
  //*/
  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
    .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get((req, res) => {
      res.sendFile(path.resolve(`${app.get('appPath')}/index.html`));
    });
}