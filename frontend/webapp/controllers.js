aircheckvaasa.controller('mapCtrl', function($scope,$rootScope, $http, NgMap)
{
    navigator.geolocation.getCurrentPosition(
    function(position)
    {
        getbox(position.coords.latitude, position.coords.longitude);
        NgMap.getMap().then(function(map) {
            console.log(map.getCenter())
            map.setCenter(new google.maps.LatLng(position.coords.latitude, position.coords.longitude))
        });
        var latilongi = [];
        var lati = Math.floor(position.coords.latitude)
        var longi = Math.floor(position.coords.longitude)
        $scope.myposition = [position.coords.latitude, position.coords.longitude]
        console.log($scope.myposition);
        for (var i = lati-3;i<=lati+3;i++)
        {
            for (var j = longi-3;j<=longi+3;j++)
                latilongi.push[i, j]
        }
        latilongi.forEach(function(box)
        {
            getbox(box[0], box[1]);
            })
    });
    $rootScope.showmap=true;
    $scope.myposition = [];
    $scope.boxes = [];
    function getbox(latitude, longitude)
    {$http.get('http://localhost:8080/api/boxes?latitude='+latitude+'&longitude='+longitude).then(function (res)
    {
        console.log(res.data)
        var ris = "";
        if (res.data.risk>0.1)
            ris = "#FFFF00";
        if (res.data.risk>0.7)
            ris = "FFFF00";
            
        var box = {lat: latitude+1, long: longitude+1, riskcolor:ris, risk: res.data.risk}
       /*res.data.events.forEach(function(ev)
       {
           box.events.push(ev);
       })*/
       console.log(box)
      $scope.boxes.push(box);
    })}
})

aircheckvaasa.controller('reportCtrl', function($rootScope, $http, $location)
{
    $rootScope.showmap=false;
    $rootScope.sent = false;
    $scope.risk="";
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