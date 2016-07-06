(function() {
  'use strict';

  angular
    .module('doneyet.timer')
    .controller('TimerController', TimerController);
  
  TimerController.$inject = [
    '$http',
    '$stateParams',
    '$state',
    'TimerService'
  ];

  function TimerController($http, $stateParams, $state, TimerService) {
    var vm = this;
    vm.checkFormErrors = checkFormErrors;
    vm.deleteTimer = deleteTimer;
    vm.editMode = false;
    vm.pageTitle = 'Dynamic Page Title';
    vm.saveTimer = saveTimer;
    vm.timer = {};
    vm.timerFormDisabled = true;
    loadTimer($stateParams.timer);

  
    function checkFormErrors(form) {
      if (typeof vm.timer.alerts !== typeof undefined) {
        if (typeof vm.timer.alerts.sms !== typeof undefined) {
          if (vm.timer.alerts.sms.enabled) {
            if (vm.timer.alerts.sms.enabled) {
              if (typeof vm.timer.alerts.sms.value === typeof undefined || vm.timer.alerts.sms.value.length === 0) {
                return true;
              }
            }
          }
        }
        if (typeof vm.timer.alerts.email !== typeof undefined) {
          if (vm.timer.alerts.email.enabled) {
            if (vm.timer.alerts.email.enabled) {
              if (typeof vm.timer.alerts.email.value === typeof undefined || vm.timer.alerts.email.value.length === 0) {
                return true;
              }
            }
          }
        }
        if (typeof vm.timer.alerts.pushbullet !== typeof undefined) {
          if (vm.timer.alerts.pushbullet.enabled) {
            if (vm.timer.alerts.pushbullet.enabled) {
              if (typeof vm.timer.alerts.pushbullet.value === typeof undefined || vm.timer.alerts.pushbullet.value.length === 0) {
                return true;
              }
            }
          }
        }
      }
      return !$.isEmptyObject(form.$error);
    }
  
    function deleteTimer() {
      TimerService.deleteTimer(vm.timer)
        .then(function success(response) {
          console.log("Timer removed");
          TimerService.loadTimers();
          $state.go('doneyet.home');
        }, function error(response) {
          console.log(response);
        });
    }

    function loadTimer(timer) {
      if (timer != null) {
        vm.timer._id = timer._id;
        vm.timer.name = timer.name;
        vm.timer.type = timer.type;
        vm.timer.doubleStartMode = timer.doubleStartMode;
        vm.timer.private = timer.private;
        vm.timer.description = timer.description;
        vm.timer.alerts = timer.alerts;
      }
      else {
        vm.timerFormDisabled = false;
        console.log("LOAD: Add Timer Mode");
      }
    }

    function saveTimer() {
      if (!vm.timer) {
        console.log('SAVE: No timer defined');
      }
      else if (vm.timer._id) {
        // if we have a timer._id we are updating the record
        vm.timerFormDisabled = true;
        TimerService.updateTimer(vm.timer)
          .then(function success(response) {
            console.log('timer updated');
            TimerService.loadTimers();
          }, function error(response) {
            console.log('timer not updated :(');
          });
      }
      else {
        // otherwise we are saving a new one
        vm.timerFormDisabled = true; 
        TimerService.addTimer(vm.timer)
          .then(function success(response) {
            console.log("timer.controller.succ.saveTimer");
            TimerService.loadTimers();
            $state.go('doneyet.home');
          }, function error(response) {
            console.log("timer.controller.fail.saveTimer");
          });
      }
    }

    function updateTimer() {
      TimerService.loadTimers();
      $state.go('doneyet.home');
    }
  }
})();
