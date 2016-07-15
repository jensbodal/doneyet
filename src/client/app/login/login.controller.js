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
      console.log("CONTR: " + vm.email);
      AuthenticationService.login(vm.email, function(authenticated, res) {
        console.log(authenticated);
        if (authenticated) {
          $location.path('/');
        }
      });
    }

    function logout() {
      console.log("LOGGING OUT");
      AuthenticationService.logout();
      $state.go('login');
    }
  }
})();
