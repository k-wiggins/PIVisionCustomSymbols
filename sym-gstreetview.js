(function (PV) {
	
	function symbolVis() { }
	PV.deriveVisualizationFromBase(symbolVis);
	
    var definition = {
        typeName: 'gstreetview',
 	    datasourceBehavior: PV.Extensibility.Enums.DatasourceBehaviors.Multiple,
		iconUrl: 'Scripts/app/editor/symbols/ext/libraries/Icons/streetview.svg',
        getDefaultConfig: function () {
            return {
                DataShape: 'Table',
                Height: 400,
                Width: 400,
                HeadingIndex: 0,
                ZoomIndex: 4,
                LatIndex: 1,
                LngIndex: 2,
                PitchIndex: 3,
                AddressControl: true,
                ClickToGo: true,
                DisableDefaultUI: false,
                DisableDoubleClickZoom: false,
                ImageDateControl: true,
                PanControl: true,
                ZoomControl: true
            };
        },
		visObjectType: symbolVis,
        configOptions: function () {
            return [{
                title: 'Format Symbol',
                mode: 'format'
            }];
        }
    };

    function loadGoogleMaps() {
        if (window.google == undefined) {
            if (window.googleRequested) {
                setTimeout(function () {
                    window.gStreetViewCallback();
                }, 3000);

            }
            else {
                var script_tag = document.createElement('script');
                script_tag.setAttribute("type", "text/javascript");
                //script_tag.setAttribute("src", "https://maps.google.com/maps/api/js?sensor=false&callback=gStreetViewCallback");
				script_tag.setAttribute("src", "https://maps.google.com/maps/api/js?key=AIzaSyCTk13w-D1_ykJnV0FoZCzKA_XW1T8uo5o&callback=gStreetViewCallback");
                (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(script_tag);
                window.googleRequested = true;
            }
        }
        else {
            window.gStreetViewCallback();
        }
    }


   symbolVis.prototype.init = function init(scope, elem) {
		this.onDataUpdate = dataUpdate;
	    this.onConfigChange = configChanged;
	    this.onResize = resize;
        var container = elem.find('#container')[0];
        var id = "gstreetview_" + Math.random().toString(36).substr(2, 16);
        container.id = id;
        scope.id = id;
		
		window.gStreetViewCallback = function () {
			$(window).trigger('gSvLoaded');
		}
		scope.currentLatLng = { lat:42.359696, lng:-71.090072};
		
		scope.startStreetView = function () {
            if (scope.panorama == undefined) {
                scope.panorama = new google.maps.StreetViewPanorama(document.getElementById(scope.id), {
                    position: scope.currentLatLng,
                    pov: {
                        heading: 0,
                        pitch: 0,
                        zoom: 1
                    }
                });
            }
            configChanged(scope.config);
        };



        function configChanged(config, oldConfig) {
            scope.LatIndex = parseInt(config.LatIndex);
            scope.LngIndex = parseInt(config.LngIndex);
            scope.HeadingIndex= parseInt(config.HeadingIndex);
            scope.PitchIndex = parseInt(config.PitchIndex);
            scope.ZoomIndex = parseInt(config.ZoomIndex);
            if (scope.panorama != undefined) {
                scope.panorama.setOptions({	
                    addressControl: config.AddressControl,
                    clickToGo: config.ClickToGo,
                    disableDefaultUI: config.DisableDefaultUI,
                    disableDoubleClickZoom: config.DisableDoubleClickZoom,
                    imageDateControl: config.ImageDateControl,
                    panControl: config.PanControl,
                    zoomControl: config.ZoomControl
                });
            }
        };

		function resize(width, height) {
            if (scope.panorama != undefined) {
                google.maps.event.trigger(scope.panorama, "resize");
            }
        }



        $(window).bind('gSvLoaded', scope.startStreetView);
        loadGoogleMaps();




		function dataUpdate(data) {
            if (scope.panorama != undefined && data != null) {
                var currentPov = {
					heading: parseFloat(data.Rows[scope.HeadingIndex].Value),
                    pitch: parseFloat(data.Rows[scope.PitchIndex].Value),
                    zoom: parseFloat(data.Rows[scope.ZoomIndex].Value)
                }
				if (scope.LatIndex) {
                    scope.currentLatLng = { lat: parseFloat(data.Rows[scope.LatIndex].Value), lng: parseFloat(data.Rows[scope.LngIndex].Value) };
					scope.panorama.setOptions({
                        position: scope.currentLatLng,
                        pov: currentPov
                    });
                }
            }
        }
    }

    PV.symbolCatalog.register(definition);
})(window.PIVisualization);