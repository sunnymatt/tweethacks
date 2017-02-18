'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider.state('about', {
    url: '/about',
    template: require('./about.html')
  });
}
