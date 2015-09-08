/**
 * 
 */

var UI = require('ui');
var ajax = require('ajax');


// String, Truncate
String.prototype.truncate = String.prototype.truncate ||
    function (n) {
        return this.length>n ? this.substr(0, n-1) + '..' : this;
};
// String, Padding
String.prototype.padding = String.prototype.padding ||
    function (text, paddingChar, length, padLeftRight) {
        for (i = text.length(); i <= length; i++) { 
            if (padLeftRight == 'left') {
                text = paddingChar + text;
            } else {
                text = text + paddingChar;
            }
        }
    
        return text;
}


/**
 * WINDOW DEFINITIONS
 */

/**
 * mainMenu display's all stations
 */
var mainMenu = new UI.Menu({
    sections: [{
        items: [
            {
                title: 'Westkreuz',
                subtitle: 'S-Bahn',
                dataUrl: 'http://www.mvg-live.de/ims/dfiStaticAnzeige.svc?haltestelle=Westkreuz+Bf.&ubahn=&bus=&tram=&sbahn=checked',
                dataStationDrop : ['herrsching', 'tutzing', 'Weßling(Oberbay)']
            }, 
            {
                title: 'Westkreuz Bus',
                subtitle: 'Bus',
                dataUrl: 'http://www.mvg-live.de/ims/dfiStaticAnzeige.svc?haltestelle=Westkreuz+Bf.&ubahn=&bus=checked&tram=&sbahn',
                dataStationDrop : ['Neuaubing West']
            },             
            {
                title: 'Dietlindenstr.',
                dataUrl: 'http://www.mvg-live.de/ims/dfiStaticAnzeige.svc?haltestelle=Dietlindenstra%dfe&ubahn=checked&bus=&tram=&sbahn=',
                dataStationDrop : ['Fröttmaning', 'Garching-Forschungszentrum']
            },             
            {
                title: 'Marienplatz',
                subtitle: 'S-Bahn',
                dataUrl: 'http://www.mvg-live.de/ims/dfiStaticAnzeige.svc?haltestelle=Marienplatz&ubahn=&bus=&tram=&sbahn=checked',
                dataStationDrop : ['Ebersberg(Oberbay)', 
                                   'Deisenhofen', 
                                   'Petershausen(Obb)', 
                                   'Wolfratshausen', 
                                   'Höhenkirchen-Siegertsbrunn',
                                   'München Ost',
                                   'Markt Schwaben',
                                   'Maisach',
                                   'München Flughafen Terminal',
                                   'Holzkirchen'
                                  ]
            },
            {
                title: 'Marienplatz',
                subtitle: 'U-Bahn',
                dataUrl: 'http://www.mvg-live.de/ims/dfiStaticAnzeige.svc?haltestelle=Marienplatz&ubahn=checked&bus=&tram=&sbahn=',
                dataStationDrop : ['Klinikum Großhadern',
                                   'Fürstenried West'
                                  ]
            }                        
        ]
    }]
});

/**
 * EVENT DEFINITIONS
 */

mainMenu.on('select', function(e) {
    //console.log('Selected station #' + e.itemIndex + ' of section #' + e.sectionIndex);
    //console.log('Station title "' + e.item.title + '"');
  
    // Make request to MVG
    ajax(
        {
            url: e.item.dataUrl
        },
        function(response) {
            // remove line breaks
            response = response.replace(/(\r\n|\n|\r)/gm, "");
            // regex to identify rows
            var responseArray = response.match(/<tr class="row(even|odd)">(.+?)<\/tr>/gi);
            var resultBody = '';
            console.log(e.item.dataStationDrop);
            
            // loop through array and build departure text lines
            responseArray.forEach(function (element, index, array) {
                var dropDeparture = false;
                
	            var destination = element.match(/<td class="stationColumn">(.*?)<span/);
                e.item.dataStationDrop.forEach(function(dropElement, dropIndex, dropArray) {
                    if (dropElement.toLowerCase() == destination[1].trim().toLowerCase()) {
                        dropDeparture = true;
                    }
                });

                if (dropDeparture === false) {
                
                    var line = element.match(/<td class="lineColumn">(.*?)<\/td>/);
                    if (line !== null) { line = line[1].trim(); }
        
                    if (destination !== null) { destination = destination[1].trim().truncate(9); }
                    
    	            var departure = element.match(/<td class="inMinColumn">(.*?)<\/td>/);
                    if (departure !== null) { departure = departure[1].trim(); }
        
                    // add destination to output
                    if (line !== null && destination !== null && departure !== null) {
                        // padding: http://stackoverflow.com/a/32016635/3712979
                        var departureLine = ('  ' + departure).substr(-2) + 'm: ' + line + ' ' + destination;
                        console.log(departureLine);
                        resultBody = resultBody + "\n" + departureLine;
                    }
                }
            });
            
            var stationCard = new UI.Card({
                title: e.item.title,
                subtitle: e.item.subtitle,
                scrollable: true,
                style: 'mono',
                body: resultBody
            });
            stationCard.show();
        },
        function(error) {
            console.log('Could not open MVG, error: ' + error);
        }
    );    
   
    
});


/**
 * START
 */
mainMenu.show();