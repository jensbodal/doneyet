(function() {
  'use strict';

  angular
    .module('doneyet.home')
    .controller('HomeController', HomeController);
  
  HomeController.$inject = [
    '$localStorage'
  ];

  function HomeController($localStorage) {
    var vm = this;
    vm.pageTitle = 'Dynamic Page Title';
    vm.checkbox1 = true;
    vm.getUsername = getUsername;

    function getUsername() {
      return $localStorage.authenticatedUser;
    }
  }

})();
