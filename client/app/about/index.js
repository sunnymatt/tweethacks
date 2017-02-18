'use strict';

import angular from 'angular';
import routes from './about.routes';

export default angular.module('tweethacksApp.about', ['ui.router'])
  .config(routes)
  .name;
