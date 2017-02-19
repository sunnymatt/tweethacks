import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './main.routes';

export class MainController {

  awesomeThings = [];
  newThing = '';
  searchExec = false;
  username = '';
  friendname = '';
  usersToCheck = {};
  friendsTweets = {};
  friendsTweetScores = {};
  friendsDepressScores = {};

  /*@ngInject*/
  constructor($http) {
    this.$http = $http;
  }

  $onInit() {
    this.$http.get('/api/things')
      .then(response => {
        this.awesomeThings = response.data;
        console.log(this.awesomeThings);
      });
  }

  addThing() {
    /*if(this.newThing) {
      this.$http.post('/api/things', {
        name: this.newThing
      });
      this.newThing = '';
    }*/
  }

  deleteThing(thing) {
    //this.$http.delete(`/api/things/${thing._id}`);
  }

  addFollowersFromHandle(username) {
    this.username = "";
    var self = this;
    this.$http.get('/followers/' + username)
      .then(response => {
        for (var follower in response.data) {
          this.usersToCheck[Object.keys(this.usersToCheck).length] = response.data[follower]; // add one by one
        }
      });
  }

  addUserToCheck(handle) {
    this.usersToCheck[Object.keys(this.usersToCheck).length] = handle; // add one by one
    this.friendname = "";
  }

  removeUserToCheck(index) {
    delete this.usersToCheck[index];
  }

  runSearch() {
    var self = this;
    this.$http({
      method: 'GET',
      url: '/twitter',
      headers: {
        names: JSON.stringify(this.usersToCheck)
      }
    }).then(response => {
      self.friendsTweets = response.data;
      //console.log(self.friendsTweets);
      for(var friend in self.friendsTweets) {
        let friendName = friend;
        self.$http({
          method: 'POST',
          url: '/analyze/sadness',
          data: {
            tweets: JSON.stringify(self.friendsTweets[friendName])
          }
        }).then(response => {
          self.friendsTweetScores[friendName] = response.data;  // get scores for tweets
          console.log(friendName, response.data);
          self.$http({
            method: 'GET',
            url: '/compute',
            headers: {
              scores: JSON.stringify(response.data),
            }
          }).then(response => {
            console.log(friendName, response.data);
            self.friendsDepressScores[friendName] = parseFloat(response.data);
          })
        });
      }
      self.searchExec = true;
      self.usersToCheck = {};
    });
  }

  canCheckUsers() {
    return Object.keys(this.usersToCheck).length > 0;
  }

  getColor(score) {
    return {'color': 'rgba(255,'+Math.round(255*(1-score))+',0,1)'};
  }

  getColorRect(score) {
    return {
      'background-color': 'rgba(255,'+Math.round(255*(1-score))+',0,1)',
      //'height': '20px',
      'width': Math.round(500*score)+'px'
    };
  }
  
  makeTweet(user) {
    //console.log(user);
    return encodeURIComponent('@'+user+' Hey! Just wanted to say hi and check in with you. Hope everything is going well, and I\'m always here for you!');
  }

  goBack() {
    this.searchExec = false;
  }
}

export default angular.module('tweethacksApp.main', [uiRouter])
  .config(routing)
  .component('main', {
    template: require('./main.html'),
    controller: MainController,
    controllerAs: 'mc'
  })
  .name;