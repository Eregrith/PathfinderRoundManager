prm = angular.module('PathfinderRoundManagerApp', []);

prm.factory('FightersFactory', ['$http', function ($http) {
    return {
        SaveFighters: function SaveFighters(fighters, presets) {
            localStorage.fighters = angular.toJson(fighters);
            localStorage.presets = angular.toJson(presets);
        },
        GetFighters: function GetFighters() {
            fighters = angular.fromJson(localStorage.fighters);
            fighters = fighters || [];
            return fighters;
        },
		GetPresets: function GetPresets() {
			presets = angular.fromJson(localStorage.presets);
			presets = presets || [];
			return presets;
		}
    }
}]);
prm.factory('RoundsFactory', ['$http', function ($http) {
    function sumOfRoundTimes(fighters) {
        var sum = 0;
        for (f in fighters) {
            if (fighters[f].RoundTimeInSeconds === undefined) continue;
            sum += fighters[f].RoundTimeInSeconds;
        }
        return sum;
    }
    return {
        SaveRound: function SaveRound(fighters) {
			var totalTime = sumOfRoundTimes(fighters);
            if (totalTime == 0) return;
			var rounds = this.GetRounds();
			var round = { Fighters: fighters, Number: rounds.length + 1, TotalTime: totalTime };
            rounds.push(round);
            localStorage.rounds = angular.toJson(rounds);
        },
        GetRounds: function GetRounds() {
            var rounds = angular.fromJson(localStorage.rounds);
            rounds = rounds || [];
            return rounds;
        },
        ClearRounds: function ClearRounds() {
            delete localStorage.rounds;
        }
    }
}]);

prm.controller('IndexController', ['$scope', '$interval', 'FightersFactory', 'RoundsFactory', function ($scope, $interval, FightersFactory, RoundsFactory) {
    var fighterId = 0;
	var presetId = 0;

    $scope.fighters = FightersFactory.GetFighters();
	$scope.presets = FightersFactory.GetPresets();
    for (f in $scope.fighters) {
        if ($scope.fighters[f].Selected) selectFighter(f);
        if ($scope.fighters[f].Id > fighterId)
            fighterId = $scope.fighters[f].Id;
    }
    for (f in $scope.presets) {
        if ($scope.presets[f].Id > presetId)
            presetId = $scope.presets[f].Id;
    }
    fighterId++;
    presetId++;
    $scope.rounds = RoundsFactory.GetRounds();
    $scope.Math = window.Math;

    $scope.menu = [
        { Name: 'Add fighter', ClickAction: addFighter },
        { Name: 'Add preset', ClickAction: addPreset }
    ];

    function makeFighter(name, init, bonus) {
        return {
            Id: fighterId++,
            Name: name,
            Init: init*1 + (bonus/100),
            InitBonus: bonus,
            Selected: false,
            Timer: undefined,
            RoundTimeInSeconds: 0,
            Damage: 0
        };
    }

    function makePreset(name, bonus) {
        return {
			Id: presetId++,
            Name: name,
            InitBonus: bonus,
        };
    }

    function locationOfFighter(element, start, end) {
        start = start || 0;
        end = end || $scope.fighters.length;
        var pivot = parseInt(start + (end - start) / 2, 10);
        if (end - start <= 1 || $scope.fighters[pivot].Init === element.Init) return pivot;
        if ($scope.fighters[pivot].Init < element.Init) {
            return locationOfFighter(element, pivot, end);
        } else {
            return locationOfFighter(element, start, pivot);
        }
    }

    function addInPlace(fighter) {
        $scope.fighters.splice(locationOfFighter(fighter) + 1, 0, fighter);
    }
    function addInPresets(fighter) {
		$scope.presets.push(fighter);
    }

    function addFighterWithStats(name, init, initbous) {
        var fighter = makeFighter(name, init, initbous);
        
        addInPlace(fighter);
    }
	
    function addPresetWithStats(name, initbous) {
        var fighter = makePreset(name, initbous);
        
        addInPresets(fighter);
    }

    function addFighter() {
		$('#addFighterModal').modal("show");
	}
	
	$scope.addFighterFromPreset = function addFighterFromPreset(name, init) {
		$("#name").val(name);
		$("#initBonus").val(init);
		$('#addFighterModal').modal("show");
	}

    function addPreset() {
		$('#addPresetModal').modal("show");
	}
	
	$scope.confirmAddFighter = function confirmAddFighter() {
		var name = $("#name").val();
        var init = $("#init").val();
        var initBonus = $("#initBonus").val();

		if (angular.isDefined(name) && angular.isDefined(init) && angular.isDefined(initBonus)
			&& name !== "" && init !== "" && initBonus !== "") {
			addFighterWithStats(name, init, initBonus);
			$('#addFighterModal').modal("hide");
		}
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
	
    function tick(f) {
        if ($scope.fighters[f] === undefined) unselectFighter(f);
        else if (!$scope.fighters[f].Selected) unselectFighter(f);
        else $scope.fighters[f].RoundTimeInSeconds++;
    }

    function stopTimerFor(f) {
        if (angular.isDefined($scope.fighters[f]) && angular.isDefined($scope.fighters[f].Timer)) {
            console.log("Stopping timer for fighter", f, $scope.fighters[f]);
            $interval.cancel($scope.fighters[f].Timer);
            $scope.fighters[f].Timer = undefined;
        }
    }

    function startTimerFor(f) {
        if (angular.isDefined($scope.fighters[f])) $scope.fighters[f].Timer = $interval(function () { tick(f); }, 1000);
    }

    function unselectFighter(f) {
        stopTimerFor(f);
        if (angular.isDefined($scope.fighters[f])) $scope.fighters[f].Selected = false;
    }
    function selectFighter(f) {
        startTimerFor(f);
        if (angular.isDefined($scope.fighters[f])) $scope.fighters[f].Selected = true;
    }

    $scope.selectFighter = function (id) {
        for (f in $scope.fighters) {
            if ($scope.fighters[f].Selected) unselectFighter(f);
            else if ($scope.fighters[f].Id === id) selectFighter(f);
        }
    }

    function ii(i, len) {
        var s = i + "";
        len = len || 2;
        while (s.length < len) s = "0" + s;
        return s;
    }

    $scope.formatRoundTime = function (time) {
        var hours = Math.floor(time / 3600);
        var minutes = Math.floor((time - hours * 3600) / 60);
        var seconds = (time - hours * 3600 - minutes * 60);

        var format = "";
        if (hours > 0) format += hours + "h";
        if (hours > 0 || minutes > 0) format += ii(minutes) + "m" + ii(seconds) + "s";
        else format += seconds + "s";
        return format;
    }

    var suspendAutoSave = false;
    $scope.nextRound = function () {
        suspendAutoSave = true;
        RoundsFactory.SaveRound($scope.fighters);
        for (i in $scope.fighters) {
            $scope.fighters[i].RoundTimeInSeconds = 0;
            unselectFighter(i);
        }
        suspendAutoSave = false;
        $scope.rounds = RoundsFactory.GetRounds();
    }

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
	
    $scope.deleteFighter = function (fighter) {
        for (i in fighters) {
            if (fighters[i].Id == fighter.Id)
                fighters.splice(i, 1);
        }
    }

    $scope.deletePreset = function (preset) {
        for (i in presets) {
            if (presets[i].Id == preset.Id)
                presets.splice(i, 1);
        }
    }

    $scope.autosaving = false;
    $scope.autosavingFade = 0;
    var autosaveInterval = $interval(function autosave() {
        if (suspendAutoSave) return;
        $scope.autosavingFade = 1;
        FightersFactory.SaveFighters($scope.fighters, $scope.presets);
        $scope.autosaving = true;
        $interval(function () { $scope.autosavingFade -= 0.1; }, 100, 10);
        $interval(function () { $scope.autosaving = false; }, 1000, 1);
    }, 10000);

    $scope.exportRoundsToCSV = function exportRoundsToCSV() {
        var csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Round #";
        for (i in $scope.fighters) {
            csvContent += ",";
            csvContent += $scope.fighters[i].Name
        }
        csvContent += "\n"
        $scope.rounds.forEach(function (round, index) {

            var dataString = round.Number;
            for (i in round.Fighters) {
                dataString += ",";
                dataString += round.Fighters[i].RoundTimeInSeconds;
            }
            csvContent += index < $scope.rounds.length ? dataString + "\n" : dataString;

        });
        var encodedUri = encodeURI(csvContent);
        var link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "my_data.csv");
        document.body.appendChild(link); // Required for FF

        link.click();
    }
	
	$scope.clearRounds = function clearRounds() {
		if (confirm("Clear all existing rounds? This can't be undone")) {
			RoundsFactory.ClearRounds();
			$scope.rounds = [];
		}
	}
}]);