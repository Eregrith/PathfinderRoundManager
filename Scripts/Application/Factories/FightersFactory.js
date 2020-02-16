var myApp = angular.module('PathfinderRoundManagerApp');

myApp.factory('FightersFactory', ['$http', function ($http) {
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
            let presets = [];
            if (localStorage.presets != undefined){
                presets = angular.fromJson(localStorage.presets);
            }
			return presets;
		}
    }
}]);