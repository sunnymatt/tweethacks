/**
 * Main application routes
 */

'use strict';

import errors from './components/errors';
import path from 'path';

export default function (app) {
  let Twitter = require('twitter');

  let twit = new Twitter({
    consumer_key: 'iq5MbK4YG0TcAICnyw9l7CUXf',
    consumer_secret: 'T08N6iJ8L2H0RP9KAoJ6IrpnHpnY8ADbRJOM2FWCP6tBRMyNCH',
    access_token_key: '354089015-QkVdLx1wNGRsEeNYMk0i3ANkQp9hgwc9mlxLdpRu',
    access_token_secret: 'xSzlyhKtkc7fhI07mSeOzax8AJ7UkFSsELQintlSApA0F'
  });

  let numTweets = 20;

  // Insert routes below
  app.use('/api/things', require('./api/thing'));
  app.use('/api/users', require('./api/user'));
  app.use('/api/twitter', require('./api/twitter'));

  app.use('/auth', require('./auth').default);


  app.get('/followers/:name', function(req, response) {
    console.log(req.params.name)
    var x = [];
    twit.get('followers/list', {screen_name: req.params.name}, 
      function(error, followers, res)
      {
        if(error) 
        {
          console.log("Error!!")
          console.log(error)
        } else 
        {
          for(var i in followers['users'])
          {
            console.log(i, ': ', followers['users'][i]['screen_name']);
            x.push(followers['users'][i]['screen_name']);
          }
        }
        response.status(200).send(x);
      });

  });

  app.get('/twitter', function (req, response) {
    let names = JSON.parse(req.headers.names);

    var all_tweets = {};

    var numFollowers = Object.keys(names).length;
    var numFollowersDone = 0;

    //Iterate over all the handles in the header
    for(var property in names)
    {
      let name = names[property];
      console.log(names[property]);
      twit.get('statuses/user_timeline', {screen_name: name, count: numTweets}, 
        function(error, tweets, res)
        {
          var ind_tweets = [];
          if(error)
          {
            ind_tweets.push("error")
            console.log('Error!!')
            console.log(error)
          } else 
          {
            console.log(name, ": ");
            for(var i in tweets) 
            {
              ind_tweets.push(tweets[i]['text'])
              //console.log(i, ":  ", tweets[i]['text'])
            }
          }
          console.log(ind_tweets)
          all_tweets[name] = ind_tweets;
          numFollowersDone++;

          if(numFollowers == numFollowersDone) 
          {    
            response.status(200).send(all_tweets);
          }
        });
    }
  });

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
    .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get((req, res) => {
      res.sendFile(path.resolve(`${app.get('appPath')}/index.html`));
    });
}