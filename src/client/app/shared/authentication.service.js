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
      // store login state in service
      service.loggedIn = true;
      
      // store username and token so that user remains logged in between page refreshes
      console.log("ME: " + username);
      $localStorage.authenticatedUser = { username: username, token: username};

      // add auth token to header for all requests made by the $http service
      $http.defaults.headers.common.Authorization = username;
      
      // indicate successful login
      return callback(true);
    }


    function logout() {
      // remove user from local storage and clear http auth header
      service.loggedIn = false;
      delete $localStorage.authenticatedUser;
      $http.defaults.headers.common.Authorization = '';
    }
  }
})();
