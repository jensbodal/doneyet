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

    function login(username, password, callback) {
      var config = {
        username: username,
        password: password
      };
      
      return $http.post('/api/authenticate', config).then(function success(response) {
        // store login state in service
        service.loggedIn = true;
        console.log(response); 
        var user = response.data.user;
        var token = response.data.token;
        var promiseResponse = {
          user: user,
          token: token
        };
        // store username and token so that user remains logged in between page refreshes
        $localStorage.authenticatedUser = user;
        $localStorage.token = token;

        // add auth token to header for all requests made by the $http service
        $http.defaults.headers.common.token = $localStorage.token;
        $http.defaults.headers.common.username = $localStorage.authenticatedUser;
        
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
