aircheckvaasa.controller('mapCtrl', function($rootScope)
{
    $rootScope.showmap=true;
    
})

aircheckvaasa.controller('reportCtrl', function($rootScope, $http, $location)
{
    $rootScope.showmap=false;
    $rootScope.sent = false;
    var day = new Date();
    if(!$rootScope.hour)
        {
            
            $rootScope.hour=day.getHours()-1;}
    this.submit= function(symp, seve)
    {
         var d = new Date();
        if (navigator.geolocation && $rootScope.hour<d.getHours()) {
            navigator.geolocation.getCurrentPosition(
                function(position)
                {
                   
                    var obj = 
                    {
                        timestamp: d.toLocaleString(),
                        hour: d.getHours(),
                        dimensions:
                        {
                            lat: Math.floor(position.coords.latitude),
                            lng: Math.floor(position.coords.longitude)
                        },
                        symptom: symp+','+seve.toString()
                    }
                   $http.post( 'http://localhost:8080/api/symptom',
                       obj).then(function(res)
                       {
                           $rootScope.sent = true;
                           $rootScope.hour=d.getHours();
                       })
                }
                
            );
  
        }
        
    }
    this.symptoms = 
    [
        "cough",
        "shortness of breath",
        "sore throat",
        "nausea",
        "dizziness",
        "rash",
        "burn in skin",
        "red eyes"
    ]
})