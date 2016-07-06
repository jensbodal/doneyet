(function() {
  'use strict';

  angular
    .module('doneyet.left')
    .controller('LeftController', LeftController);
  
  LeftController.$inject = [
    '$state',
    'TimerService',
    '$scope'
  ];

  function LeftController($state, TimerService, $scope) {
    var vm = this;
    vm.addTimer = addTimer;
    vm.loadTimer = loadTimer;
    vm.pageTitle = 'Dynamic Page Title';
    vm.test = false;
    vm.getTimers = getTimers();
    vm.goHome = goHome;
    vm.timers = [];
  
    $scope.$watch(TimerService.getTimers, function() {
      vm.timers = TimerService.getTimers();
    });

    TimerService.loadTimers().then(function(timers) {
      vm.timers = TimerService.getTimers();
    });
 
    function addTimer() {
      $state.go('doneyet.timer', {timer: null});
    }

    function getTimers() {
      return TimerService.getTimers();
    }

    function loadTimer(timer) {
      $state.go('doneyet.timer', {timer: timer});
    }

    function goHome(event) {
      vm.test = !vm.test;
      $state.go('doneyet.home');
    }
  }

})();
