var myApp = angular.module('PathfinderRoundManagerApp');

myApp.controller('HurtFighterController', function ($scope) {
    
	$scope.hurtingFighter = undefined;
	$scope.hurtFighter = function (fighter) {
		$scope.hurtingFighter = fighter;
        $("#hurtFighterModal").modal("show");
        return false;
	}

	$scope.confirmHurtFighter = function () {
        if (isNaN($scope.hurtingFighter.Damage))
            $scope.hurtingFighter.Damage = 0;
		$scope.hurtingFighter.Damage += parseInt($("#damageAmount").val());
		$("#damageAmount").val("");
		$("#hurtFighterModal").modal("hide");
	}
});