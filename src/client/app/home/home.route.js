(function () {
  'use strict';

  angular
    .module('doneyet.home')
    .config(HomeConfig)
    .run(run);

    HomeConfig.$inject = [ 
      '$stateProvider',
      '$urlRouterProvider'
    ];

    function HomeConfig($stateProvider, $urlRouterProvider) {
      // all unknown routes go to homepage
      $urlRouterProvider.otherwise('/');

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
        })
        .state('login', {
          url: '/login',
          views: {
            'doneyetMain': {
              templateUrl: 'app/login/login.template.html',
              controller: 'LoginController',
              controllerAs: 'vm'
            }
          }
        })
        .state('logout', {
          url: '/logout',
          views: {
            'doneyetMain': {
              templateUrl: 'app/login/logout.template.html',
              controller: 'LoginController',
              controllerAs: 'vm'
            }
          }
        });
    }

    run.$inject = [
      '$rootScope',
      '$http',
      '$location',
      '$localStorage'
    ];

    function run($rootScope, $http, $location, $localStorage) {
      if ($localStorage.authenticatedUser) {
        $http.defaults.headers.common.token = $localStorage.token;
        $http.defaults.headers.common.username = $localStorage.authenticatedUser;
        $http.defaults.headers.common.uuid = $localStorage.uuid;
      }
      // redirect to login page if not authenticated
      $rootScope.$on('$locationChangeStart', function(event, next, current) {
        // array of pages that can be loaded without authentication
        var nonAuthPages = ['/login', '/register'];

        var restrictedPages = nonAuthPages.indexOf($location.path()) === -1;
        if (restrictedPages && !$localStorage.authenticatedUser) {
          $location.path('/login');
        }
      });
    }
})();
