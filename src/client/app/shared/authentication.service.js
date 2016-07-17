(function () {
  'use strict';

  angular
    .module('doneyet.shared')
    .factory('AuthenticationService', AuthenticationService);

  AuthenticationService.$inject = [
    '$http',
    '$localStorage'
  ];

  function AuthenticationService($http, $localStorage) {
    var service = { };

    service.login = login;
    service.logout = logout;
    service.loggedIn = false;

    return service;

    function login(username, callback) {
      var config = {
        username: username
      };
      
      return $http.post('/api/users', config).then(function success(response) {
        // store login state in service
        service.loggedIn = true;
        
        var user = response.data.user;
        var token = response.data.token;
        var promiseResponse = {
          user: user,
          token: token
        };
        // store username and token so that user remains logged in between page refreshes
        $localStorage.authenticatedUser = user.username;
        $localStorage.uuid = user._id;
        $localStorage.token = token;

        // add auth token to header for all requests made by the $http service
        $http.defaults.headers.common.token = $localStorage.token;
        $http.defaults.headers.common.username = $localStorage.authenticatedUser;
        $http.defaults.headers.common.uuid = $localStorage.uuid;
        
        // indicate successful login
        return (promiseResponse);
      }, function error(response) {
        console.log("ERROR: " + response);
        return response;
      });

    }


    function logout() {
      // remove user from local storage and clear http auth header
      service.loggedIn = false;
      delete $localStorage.authenticatedUser;
      $http.defaults.headers.common.Authorization = '';
    }
  }
})();
