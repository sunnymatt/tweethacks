/**
 * Main application routes
 */

'use strict';

import errors from './components/errors';
import path from 'path';

export default function(app) {
  let Twitter = require('twitter');

  let twit = new Twitter({
    consumer_key: 'iq5MbK4YG0TcAICnyw9l7CUXf',
    consumer_secret: 'T08N6iJ8L2H0RP9KAoJ6IrpnHpnY8ADbRJOM2FWCP6tBRMyNCH',
    access_token_key: '354089015-QkVdLx1wNGRsEeNYMk0i3ANkQp9hgwc9mlxLdpRu',
    access_token_secret: 'xSzlyhKtkc7fhI07mSeOzax8AJ7UkFSsELQintlSApA0F'
  });

  // Insert routes below
  app.use('/api/things', require('./api/thing'));
  app.use('/api/users', require('./api/user'));

  app.use('/auth', require('./auth').default);

  app.get('/twitter', function(req, response)
  {
    console.log("req.headers: ");
    //let headers = JSON.parse(req.headers)
    //console.log("headers:  ", headers)
    /*for(let name in headers)
    {
      console.log(headers['names'][name])
      /*twit.get('statuses/user_timeline', {screen_name: name, count: 20}, 
        function(error, tweets, response)
        {
          if(error)
          {
            console.log('Error!!')
            console.log(error)
          } else 
          {
            console.log(tweets[0]['text'])
          }
        })
    } */
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
