'use strict';

import angular from 'angular';
import SignupController from './signup.controller';

export default angular.module('testerApp.signup', [])
  .controller('SignupController', SignupController)
  .name;
