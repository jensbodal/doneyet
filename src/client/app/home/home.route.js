(function () {
  'use strict';

  angular
    .module('doneyet.home')
    .config(HomeConfig);

    HomeConfig.$inject = [ 
      '$stateProvider',
      '$urlRouterProvider'
    ];

    function HomeConfig($stateProvider, $urlRouterProvider) {
      $stateProvider 
        .state('doneyet.home', {
          url: '/',
          views: {
            'doneyetContent': {
              templateUrl: 'app/home/home.template.html',
              controller: 'HomeController',
              controllerAs: 'vm'
            }
          }
        });
     
      // all unknown routes go to homepage
      $urlRouterProvider.otherwise('/');
    }
})();
