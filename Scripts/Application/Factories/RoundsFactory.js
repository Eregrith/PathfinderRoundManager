var myApp = angular.module('PathfinderRoundManagerApp');

myApp.factory('RoundsFactory', ['$http', function ($http) {
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