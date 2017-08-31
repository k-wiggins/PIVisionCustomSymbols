//scope.buildingArray=[];
(function (PV) {

    function symbolVis() { }
    PV.deriveVisualizationFromBase(symbolVis);
	//Looked at Google Maps Part 3 to configure symbol to use attribute based on name instead of index
	
    var definition = {
        typeName: 'gmaps-p2',
        datasourceBehavior: PV.Extensibility.Enums.DatasourceBehaviors.Multiple,
        iconUrl: '/Scripts/app/editor/symbols/ext/libraries/Icons/google-maps.png',
        getDefaultConfig: function () {
            var config= {
                DataShape: 'Table',
                Height: 800,
                Width: 1800,
                MarkerColor: 'rgb(255,0,0)',
                LatName: 'Latitude',
                LngName: 'Longitude',
				HistoricalMode: true,
                OpenInfoBox: true,
                ZoomLevel: 18,
                DisableDefaultUI: false,
                ZoomControl: false,
                ScaleControl: false,
                StreetViewControl: false,
				FitBounds: false,
                MapTypeControl: true,
                MapTypeId: 'ROADMAP'
            };
			return config;
        },
        visObjectType: symbolVis,
        configOptions: function () {
            return [{
                title: 'Format Symbol',
                mode: 'format'
            }];
        }
    };

    window.gMapsCallback = function () {
        $(window).trigger('gMapsLoaded');
    }
    function loadGoogleMaps() {
        if (window.google == undefined) {
            if (window.googleRequested) {
                setTimeout(function () {
                    window.gMapsCallback();
                }, 3000);

            }
            else {
                var script_tag = document.createElement('script');
                script_tag.setAttribute("type", "text/javascript");
                script_tag.setAttribute("src", "https://maps.google.com/maps/api/js?key=AIzaSyCTk13w-D1_ykJnV0FoZCzKA_XW1T8uo5o&callback=gMapsCallback");
                (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(script_tag);
                window.googleRequested = true;
            }
        }
        else {
            window.gMapsCallback();
        }
    }

    symbolVis.prototype.init = function init(scope, elem) {

	
        this.onDataUpdate = dataUpdate;
        this.onConfigChange = configChanged;
        this.onResize = resize;
		
		// No need for marker or infowindow with this map
		
        //scope.marker = null;
        //scope.infoWindow = null;

        var container = elem.find('#container')[0];
        var id = "gmaps_" + Math.random().toString(36).substr(2, 16);
        container.id = id;
        scope.id = id;
		
		//MapTypeID commented out since only the roadmap would be used
        function configChanged(config, oldConfig) {
             if (scope.map != undefined) {
                scope.map.setOptions({
                    disableDefaultUI: config.DisableDefaultUI,
                    zoomControl: config.ZoomControl,
                    scaleControl: config.ScaleControl,
                    streetViewControl: config.StreetViewControl,
                    mapTypeControl: config.MapTypeControl,
                    //mapTypeId: scope.getMapTypeId(config.MapTypeId),
                    zoom: parseInt(config.ZoomLevel)
                });
                if (config.MarkerColor != 'rgb(255,0,0)') {
                    scope.marker.setIcon('https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|' + config.MarkerColor.substr(1));
                }
            }
        };

        scope.startGoogleMaps = function () {
            if (scope.map == undefined) {
                scope.map = new window.google.maps.Map(document.getElementById(scope.id), {
                    center: { lat: 42.359696, lng: -71.090072 },
                    zoom: 18
                });
				// No need for marker
				// scope.marker = new google.maps.Marker({
                    // position: { lat: 42.360136, lng: -71.094874 },
                    // map: scope.map,
                // });
			};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	
			// Create polygon overlay on top of Google Map		
			var locations=[
				['50',42.359351, -71.088300],
				['1',42.358055, -71.092531],
				['5',42.358710, -71.092943],
				['7',42.359333, -71.093262],
				['54',42.360348, -71.089321],
				['W11',42.358259, -71.093549],
				['3',42.358937, -71.092457],
				['11',42.359521, -71.092788],
				['10',42.359750, -71.092068],
				['4',42.359440, -71.091044],
				['2',42.358917, -71.090102],
				['14',42.359195, -71.089348],
				['62',42.360183, -71.088686],
				['64',42.360324, -71.088128],
				['18',42.360115, -71.089896],
				['56',42.360637, -71.089967],
				['66',42.360932, -71.089166],
				['16',42.360401, -71.090643],
				['8',42.360078, -71.090816],
				['6',42.359510, -71.090461]
				];

			var BuildingFiftyCoords= [
				{lat:42.359540, lng:-71.088661},
				{lat:42.359427, lng:-71.088595},
				{lat:42.359447, lng:-71.088529},
				{lat:42.359206, lng:-71.088383},
				{lat:42.359184, lng:-71.088449},
				{lat:42.359071, lng:-71.088382},
				{lat:42.359208, lng:-71.087964},
				{lat:42.359678, lng:-71.088245},
				{lat:42.359540, lng:-71.088661}
				];
			var BuildingOneCoords=[
				{lat:42.358317, lng:-71.092807},
				{lat:42.357711, lng:-71.092436},
				{lat:42.357906, lng:-71.091852},
				{lat:42.357900, lng:-71.091847},
				{lat:42.357962, lng:-71.091665},
				{lat:42.358096, lng:-71.091746},
				{lat:42.358035, lng:-71.091930},
				{lat:42.358024, lng:-71.091924},
				{lat:42.357904, lng:-71.092282},
				{lat:42.358273, lng:-71.092508},
				{lat:42.358393, lng:-71.092152},
				{lat:42.358381, lng:-71.092186},
				{lat:42.358537, lng:-71.092287},
				{lat:42.358366, lng:-71.092792},
				{lat:42.358330, lng:-71.092771},
				{lat:42.358317, lng:-71.092807}
				];
			var BuildingFiveCoords=[
				{lat:42.359025, lng:-71.093242},
				{lat:42.358785, lng:-71.093095},
				{lat:42.358788, lng:-71.093086},
				{lat:42.358357, lng:-71.092823},
				{lat:42.358425, lng:-71.092615},
				{lat:42.359097, lng:-71.093025},
				{lat:42.359025, lng:-71.093242}
				];	
			var BuildingSevenCoords=[
				{lat:42.359554, lng:-71.093569},
				{lat:42.359025, lng:-71.093242},
				{lat:42.359137, lng:-71.092911},
				{lat:42.359181, lng:-71.092938},
				{lat:42.359248, lng:-71.092735},
				{lat:42.359403, lng:-71.092831},
				{lat:42.359335, lng:-71.093033},
				{lat:42.359381, lng:-71.093063},
				{lat:42.359383, lng:-71.093056},
				{lat:42.359676, lng:-71.093235},
				{lat:42.359645, lng:-71.093324},
				{lat:42.359638, lng:-71.093319},
				{lat:42.359554, lng:-71.093569}
				];
				
			var BuildingFiftyFourCoords=[
				{lat:42.360370, lng:-71.089542},
				{lat:42.360252, lng:-71.089470},
				{lat:42.360375, lng:-71.089098},
				{lat:42.360497, lng:-71.089171},
				{lat:42.360370, lng:-71.089542}
				];
				
			var BuildingWElevenCoords=[
				{lat:42.358332, lng:-71.093762},
				{lat:42.358105, lng:-71.093625},
				{lat:42.358160, lng: -71.093455},
				{lat:42.358172, lng:-71.093462},
				{lat:42.358223, lng:-71.093304},
				{lat:42.358438, lng:-71.093434},
				{lat:42.358332, lng:-71.093762}
				];
				
			var BuildingThreeCoords=[
				{lat:42.359403, lng:-71.092831},
				{lat:42.358381, lng:-71.092186},
				{lat:42.358393, lng:-71.092151},
				{lat:42.358387, lng:-71.092146},
				{lat:42.358448, lng:-71.091962},
				{lat:42.358584, lng:-71.092046},
				{lat:42.358577, lng:-71.092065},
				{lat:42.359307, lng:-71.092514},
				{lat:42.359413, lng:-71.092199},
				{lat:42.359398, lng:-71.092190},
				{lat:42.359411, lng:-71.092144},
				{lat:42.359545, lng:-71.092218},
				{lat:42.359532, lng:-71.092256},
				{lat:42.359585, lng:-71.092289},
				{lat:42.359403, lng:-71.092831}
				];
				
			var BuildingElevenCoords=[
				{lat:42.359597, lng:-71.092948},
				{lat:42.359403, lng:-71.092831},
				{lat:42.359478, lng:-71.092609},
				{lat:42.359672, lng:-71.092724},
				{lat:42.359597, lng:-71.092948}
				];
				
			var BuildingTenCoords=[
				{lat:42.359859, lng:-71.092374},
				{lat:42.359553, lng:-71.092186},
				{lat:42.359545, lng:-71.092218},
				{lat:42.359390, lng:-71.092129},
				{lat:42.359546, lng:-71.091663},
				{lat:42.360003, lng:-71.091945},
				{lat:42.359859, lng:-71.092374}
				];

			var BuildingFourCoords=[
				{lat:42.359770, lng:-71.091720},
				{lat:42.359721, lng:-71.091690},
				{lat:42.359698, lng:-71.091760},
				{lat:42.359545, lng:-71.091663},
				{lat:42.359556, lng:-71.091631},
				{lat:42.359591, lng:-71.091650},
				{lat:42.359603, lng:-71.091616},
				{lat:42.359615, lng:-71.091625},
				{lat:42.359719, lng:-71.091311},
				{lat:42.358843, lng:-71.090788},
				{lat:42.358916, lng:-71.090565},
				{lat:42.359951, lng:-71.091179},
				{lat:42.359770, lng:-71.091720}
				];

			var BuildingTwoCoords=[
				{lat:42.359079, lng:-71.090652},
				{lat:42.358916, lng:-71.090565},
				{lat:42.359029, lng:-71.090252},
				{lat:42.358660, lng:-71.090025},
				{lat:42.358543, lng:-71.090379},
				{lat:42.358553, lng:-71.090385},
				{lat:42.358492, lng:-71.090569},
				{lat:42.358356, lng:-71.090485},
				{lat:42.358417, lng:-71.090303},
				{lat:42.358424, lng:-71.090307},
				{lat:42.358616, lng:-71.089735},
				{lat:42.359258, lng:-71.090123},
				{lat:42.359079, lng:-71.090652}
				];
			var BuildingFourteenCoords=[
				{lat:42.359159, lng:-71.090070},
				{lat:42.359112, lng:-71.090040},
				{lat:42.359217, lng:-71.089724},
				{lat:42.358838, lng:-71.089488},
				{lat:42.359098, lng:-71.088712},
				{lat:42.359289, lng:-71.088829},
				{lat:42.359280, lng:-71.088852},
				{lat:42.359519, lng:-71.088999},
				{lat:42.359473, lng:-71.089134},
				{lat:42.359537, lng:-71.089172},
				{lat:42.359300, lng:-71.089878},
				{lat:42.359235, lng:-71.089838},
				{lat:42.359159, lng:-71.090070}
				];

			var BuildingSixtyTwoCoords=[
				{lat:42.360590, lng:-71.088958},
				{lat:42.359819, lng:-71.088499},
				{lat:42.359861, lng:-71.088366},
				{lat:42.360632, lng:-71.088831},
				{lat:42.360590, lng:-71.088958}
				];
			var BuildingSixtyFourCoords=[
				{lat:42.360767, lng:-71.088429},
				{lat:42.359995, lng:-71.087968},
				{lat:42.360038, lng:-71.087834},
				{lat:42.360811, lng:-71.088300},
				{lat:42.360767, lng:-71.088429}
				];
			var BuildingEighteenCoords=[
				{lat:42.360391, lng:-71.090131},
				{lat:42.359690, lng:-71.089700},
				{lat:42.359763, lng:-71.089480},
				{lat:42.360464, lng:-71.089911},
				{lat:42.360391, lng:-71.090131}
				];
			var BuildingFiftySixCoords=[
				{lat:42.360640, lng:-71.090271},
				{lat:42.360510, lng:-71.090193},
				{lat:42.360519, lng:-71.090166},
				{lat:42.360531, lng:-71.090173},
				{lat:42.360774, lng:-71.089446},
				{lat:42.360922, lng:-71.089532},
				{lat:42.360671, lng:-71.090278},
				{lat:42.360644, lng:-71.090260},
				{lat:42.360640, lng:-71.090271}
				];

			var BuildingSixtySixCoords=[
				{lat:42.361099, lng:-71.089523},
				{lat:42.360734, lng:-71.089319},
				{lat:42.361028, lng:-71.088461},
				{lat:42.361099, lng:-71.089523}
				];

			var BuildingSixteenCoords=[
				{lat:42.360415, lng:-71.090935},
				{lat:42.360406, lng:-71.090929},
				{lat:42.360393, lng:-71.090969},
				{lat:42.360305, lng:-71.090915},
				{lat:42.360318, lng:-71.090874},
				{lat:42.360269, lng:-71.090846},
				{lat:42.360252, lng:-71.090900},
				{lat:42.360199, lng:-71.090866},
				{lat:42.360243, lng:-71.090739},
				{lat:42.360307, lng:-71.090777},
				{lat:42.360510, lng:-71.090193},
				{lat:42.360640, lng:-71.090271},
				{lat:42.360415, lng:-71.090935}
				];
			var BuildingEightCoords=[
				{lat:42.360168, lng:-71.090956},
				{lat:42.360050, lng:-71.090885},
				{lat:42.359951, lng:-71.091178},
				{lat:42.359800, lng:-71.091086},
				{lat:42.359973, lng:-71.090561},
				{lat:42.360246, lng:-71.090727},
				{lat:42.360168, lng:-71.090956}
				];
			var BuildingSixCoords=[
				{lat:42.359918, lng:-71.090722},
				{lat:42.359850, lng:-71.090681},
				{lat:42.359840, lng:-71.090710},
				{lat:42.359574, lng:-71.090548},
				{lat:42.359568, lng:-71.090568},
				{lat:42.359472, lng:-71.090509},
				{lat:42.359474, lng:-71.090496},
				{lat:42.359188, lng:-71.090324},
				{lat:42.359257, lng:-71.090123},
				{lat:42.359932, lng:-71.090535},
				{lat:42.359920, lng:-71.090569},
				{lat:42.359961, lng:-71.090595},
				{lat:42.359918, lng:-71.090722}
				];


			var buildingslist= [BuildingFiftyCoords, BuildingOneCoords, BuildingFiveCoords, BuildingSevenCoords, BuildingFiftyFourCoords, BuildingWElevenCoords, BuildingThreeCoords, BuildingElevenCoords, BuildingTenCoords, 
								BuildingFourCoords, BuildingTwoCoords, BuildingFourteenCoords, BuildingSixtyTwoCoords, BuildingSixtyFourCoords, BuildingEighteenCoords, BuildingFiftySixCoords, BuildingSixtySixCoords,
								BuildingSixteenCoords, BuildingEightCoords, BuildingSixCoords];
			var buildingstrings= ["BuildingFiftyCoords", "BuildingOneCoords", "BuildingFiveCoords", "BuildingSevenCoords", "BuildingFiftyFourCoords", "BuildingWElevenCoords", "BuildingThreeCoords", "BuildingElevenCoords", 
								"BuildingTenCoords", "BuildingFourCoords", "BuildingTwoCoords", "BuildingFourteenCoords", "BuildingSixtyTwoCoords", "BuildingSixtyFourCoords", "BuildingEighteenCoords", "BuildingFiftySixCoords", 
								"BuildingSixtySixCoords", "BuildingSixteenCoords", "BuildingEightCoords", "BuildingSixCoords"];
			for (i=0; i<(buildingslist.length); i++){
				newBuilding=buildingslist[i];
				stringforbuilding=buildingstrings[i];
				buildingsPoly= new window.google.maps.Polygon({
					paths: newBuilding,
					strokeColor: '#000000',
					strokeOpacity: 0.8,
					strokeWeight: 2,
					fillColor: '#E8B82C',
					fillOpacity: 0.35,
				});	
				buildingsPoly.setMap(scope.map);
				eventcoords=buildingsPoly.addListener('click',function(event){
					openNewDisplay(event.latLng)
				});
			};
			//Opens up display depending on which building is clicked
			function openNewDisplay(latLng){
				var latLngString=JSON.stringify(latLng);
				var latLngParsed=JSON.parse(latLngString);
				console.log("You clicked on" + latLng)
				for (m=0;m<buildingslist.length;m++){
					inside= isItInPolygon(latLngParsed,buildingslist[m],m);
					if (inside==true){
						var url="https://kwiggins-vm1/pivision/#/displays/34/building-display?mode=kiosk&asset=%5C%5Ckwiggins-vm1%5Ctest%20database%5Ccampus%20map%5C";
						var memes= buildingstrings[m].substring(0,(buildingstrings[m].length-6));
						var changedUrl=(url + memes);
						window.open(changedUrl)
					};
				};
			};
			//Determines if click is within the range of a building
			function isItInPolygon(point, vs, m) {
				var x = point.lat, y = point.lng;
				var inside = false;
				for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
					var xi = vs[i].lat, yi = vs[i].lng;
					var xj = vs[j].lat, yj = vs[j].lng;
					var intersect = ((yi > y) != (yj > y))
						&& (x < ((xj - xi) * (y - yi) / (yj - yi) + xi));
					if (intersect) inside = !inside;
				}
				return inside;
			};

			locations.forEach(function(point) {
				bounds = new google.maps.LatLngBounds();
				generateIcon(point[0], function(src) {
					pos = new google.maps.LatLng(point[1], point[2]);
					bounds.extend(pos);
					scope.marker= new google.maps.Marker({
						position: pos,
						map: scope.map,
						icon: src
					});
					numeventcoords=scope.marker.addListener('click',function(event){
						openNewDisplay(event.latLng)
					});
				});
			});

		};
		//Creates number overlay on top of buildings
		var generateIconCache = {};
		function generateIcon(number, callback) {
			if (generateIconCache[number] !== undefined) {
				callback(generateIconCache[number]);
			}
			var fontSize = 24,
			imageWidth = imageHeight = 35;
			var svg = d3.select(document.createElement('div')).append('svg')
				.attr('viewBox', '0 0 54.4 54.4')
				.append('g')
			var text = svg.append('text')
				.attr('dx', 27)
				.attr('dy', 32)
				.attr('text-anchor', 'middle')
				.attr('style', 'font-size:' + fontSize + 'px; fill: #00000; font-family: Arial, Verdana; font-weight: bold')
				.text(number);
			var svgNode = svg.node().parentNode.cloneNode(true),
				image = new Image();

			d3.select(svgNode).select('clippath').remove();

			var xmlSource = (new XMLSerializer()).serializeToString(svgNode);

			image.onload = (function(imageWidth, imageHeight) {
				var canvas = document.createElement('canvas'),
					context = canvas.getContext('2d'),
					dataURL;

				d3.select(canvas)
					.attr('width', imageWidth)
					.attr('height', imageHeight);

				context.drawImage(image, 0, 0, imageWidth, imageHeight);

				dataURL = canvas.toDataURL();
				generateIconCache[number] = dataURL;

				callback(dataURL);
			}).bind(this, imageWidth, imageHeight);

			image.src = 'data:image/svg+xml;base64,' + btoa(encodeURIComponent(xmlSource).replace(/%([0-9A-F]{2})/g, function(match, p1) {
				return String.fromCharCode('0x' + p1);
			}));
		}

        $(window).bind('gMapsLoaded', scope.startGoogleMaps);
        loadGoogleMaps();	
		
        function resize(width, height) {
            if (scope.map != undefined) {
                google.maps.event.trigger(scope.map, "resize");
            }
        }


        function dataUpdate(	data) {
            if ((data == null) || (data.Rows.length == 0)) {
                return;
            }
           
            // if (scope.map != undefined) {
                // var infowindowContent = 'Last timestamp: ' + data.Rows[parseInt(scope.config.LatIndex)].Time;
                // var currentLatLng = { lat: parseFloat(data.Rows[parseInt(scope.config.LatIndex)].Value), lng: parseFloat(data.Rows[parseInt(scope.config.LngIndex)].Value) };
                // scope.marker.setPosition(currentLatLng);
                // scope.map.setCenter(currentLatLng);
                // scope.infowindow.close();
                // var marker = scope.marker;
                // google.maps.event.addListener(marker, 'mouseover', (function (marker) {
                    // return function () {							
                        // scope.infowindow.setContent(infowindowContent);
                        // scope.infowindow.open(scope.map, marker);						
                    // }
                // })(marker));
            // }
        }

        // $(window).bind('gMapsLoaded', scope.startGoogleMaps);
        // loadGoogleMaps();
    }

    PV.symbolCatalog.register(definition);
})(window.PIVisualization);