(function() {
  'use strict';

  angular
    .module('doneyet.layout')
    .config(LayoutConfig);

    LayoutConfig.$inject = [ 
      '$stateProvider',
      '$urlRouterProvider'
    ];

    function LayoutConfig($stateProvider, $urlRouterProvider) {
      $stateProvider 
        .state('doneyet', {
          abstract: true,
          views: {
            'doneyetMain': {
              templateUrl: 'app/layout/layout.template.html'
            }
          }
        });
    }
})();
