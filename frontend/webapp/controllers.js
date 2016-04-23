aircheckvaasa.controller('mapCtrl', function()
{
    
})

aircheckvaasa.controller('reportCtrl', function()
{
    this.submit(symptom, severity)
    {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                function(position)
                {
                    var d = new Date();
                    var obj = {
                        timestamp: d.toLocaleString,
                        hour: d.getHours,
                        dimensions:
                        {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        }
                    }
                   console.log(obj);
                }
                
            );
         


        }
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