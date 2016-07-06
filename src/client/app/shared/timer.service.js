(function() {
  'use strict';

  angular
    .module('doneyet.shared')
    .service('TimerService', TimerService);

  TimerService.$inject = [
    '$http'
  ];

  function TimerService($http) {
    var timers = {};
    return {
      addTimer: addTimer,
      deleteTimer: deleteTimer,
      getTimers: getTimers,
      loadTimers: loadTimers,
      updateTimer: updateTimer
    };
   
    function addTimer(timer) {
      return $http.post('/api/timers', timer)
        .then(function successCallback(response) {
          console.log("SUCCESS");
        }, function errorCallback(response) {
          console.log("FAIL");
        });
    }

    function deleteTimer(timer) {
      return $http.delete('/api/timers/' + timer._id)
        .then(function successCallback(response) {
          return "delete successful";
        }, function errorCallback(response) {
          console.log("DELETE ERROR: " + response);
        });
    }

    function getTimers() {
      return timers;
    }

    function loadTimers() {
      return $http.get('/api/timers')
        .then(function success(response) {
          timers = response.data;
        }, function (response) {
          console.log('[ERROR: TimerService.loadTimers()] ' + response);
      });
    }

    function updateTimer(timer) {
      return $http.put('/api/timers', timer)
        .then(function successCallback(response) {
          console.log('succ update');
        }, function errorCallback(response) {
          console.log('err update');
        });
    }

  }
})();
