(function() {
  'use strict';

  angular
    .module('doneyet.timer')
    .config(TimerConfig);

    TimerConfig.$inject = [ 
      '$stateProvider',
      '$urlRouterProvider'
    ];

    function TimerConfig($stateProvider, $urlRouterProvider) {
      $stateProvider 
        .state('doneyet.timer', {
          url: '/timer',
          params: {
            timer: null
          },
          views: {
            'doneyetContent': {
              templateUrl: 'app/timer/timer.template.html',
              controller: 'TimerController',
              controllerAs: 'vm'
            }
          }
        });
    }
})();
