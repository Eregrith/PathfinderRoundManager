var myApp = angular.module('PathfinderRoundManagerApp');

myApp.controller('PresetsController', ['$rootScope', '$scope', 'FightersFactory', function ($rootScope, $scope, FightersFactory){

	var presetId = 0;
	$rootScope.presets = FightersFactory.GetPresets();
    for (f in $rootScope.presets) {
        if ($rootScope.presets[f].Id > presetId)
            presetId = $rootScope.presets[f].Id;
    }
    presetId++;
    $scope.menu.push(
        { Name: 'Add preset', ClickAction: addPreset }
    );
    function makePreset(name, bonus) {
        return {
			Id: presetId++,
            Name: name,
            InitBonus: bonus,
        };
    }

    function addInPresets(fighter) {
		$rootScope.presets.push(fighter);
    }

    function addPresetWithStats(name, initbous) {
        var fighter = makePreset(name, initbous);
        
        addInPresets(fighter);
    }

    function addPreset() {
        $('#addPresetModal').modal("show");
        $("#presetName").focus();
	}
	
	$scope.confirmAddPreset = function confirmAddPreset() {
		var name = $("#presetName").val();
        var initBonus = $("#presetInitBonus").val();

		if (angular.isDefined(name) && angular.isDefined(initBonus)
			&& name !== "" && initBonus !== "") {
			addPresetWithStats(name, initBonus);
			$('#addPresetModal').modal("hide");
		}
    }

    $scope.deletePreset = function (preset) {
        for (i in $rootScope.presets) {
            if ($rootScope.presets[i].Id == preset.Id)
                $rootScope.presets.splice(i, 1);
        }
    }

	$scope.addFighterFromPreset = function addFighterFromPreset(name, init) {
		$("#name").val(name);
		$("#initBonus").val(init);
		$('#addFighterModal').modal("show");
	}
}]);