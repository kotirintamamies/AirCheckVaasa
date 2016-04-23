var aircheckvaasa = angular.module('aircheckvaasa', ['ngRoute','ngMaterial']);

aircheckvaasa.config(
    function($routeProvider, $mdThemingProvider)
    {
        
          $mdThemingProvider.theme('altTheme')
            .primaryPalette('teal')
            .accentPalette('cyan')
            $mdThemingProvider.setDefaultTheme('altTheme');
    
        $routeProvider
        .when('/map',
        {
            templateUrl: '/templates/map.html',
            controller: 'mapCtrl'
        })
        .when('/report',
        {
            templateUrl: '/templates/report.html',
            controller: 'reportCtrl',
            controllerAs: 'Report'
        }
        )
    }
)