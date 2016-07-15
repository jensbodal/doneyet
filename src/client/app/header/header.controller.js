(function() {
  'use strict';

  angular
    .module('doneyet.header')
    .controller('HeaderController', HeaderController);
  
  HeaderController.$inject = [
    '$state'
  ];

  function HeaderController($state) {
    var vm = this;
    vm.homeButtonClick = homeButtonClick;
    vm.logout = logout;
    vm.pageTitle = 'Dynamic Page Title';

    function homeButtonClick() {
      $state.go('doneyet.home');
    }

    function logout() {
      $state.go('logout');
    }
  }

})();
