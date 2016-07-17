(function() {
  'use strict';

  angular
    .module('login')
    .controller('LoginController', LoginController);
  
  LoginController.$inject = [
    'AuthenticationService',
    '$location',
    '$state'
  ];

  function LoginController(AuthenticationService, $location, $state) {
    var vm = this;
    vm.email = "";

    vm.login = login;
    vm.logout = logout;

    function login() {
      console.log("Login Controller: " + vm.email);
      AuthenticationService.login(vm.email)
        .then(function success(response) {
          console.log('Login ctrl auth %o', response);
          if (response) {
            $location.path('/');
          }
        }, function error(response) {
          console.log("ERROR: " + response); 
        });
    }

    function logout() {
      console.log("LOGGING OUT");
      AuthenticationService.logout();
      $state.go('login');
    }
  }
})();
