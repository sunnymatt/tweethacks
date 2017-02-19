'use strict';

import angular from 'angular';
import LoginController from './login.controller';

export default angular.module('testerApp.login', [])
  .controller('LoginController', LoginController)
  .name;
