(function (CS) {
    function symbolVis() { }
    CS.deriveVisualizationFromBase(symbolVis);

	symbolVis.prototype.init = function (scope, element , $http, timeProvider) {
        this.onDataUpdate = dataUpdate;

		
        function dataUpdate(data) {
            if(data) {
                if(data.Label) {
					tagname=data.Label
					for (i=0; i<tagname.length; i++){
						if (tagname[i]=='|'){
							rip=i;
							};
					};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////					
					//Retrieves building name in order to make pi web api call for its child elements
					buildingName=tagname.substring(0,rip)
					baseUrl= "https://localhost/piwebapi/search/children?parent=af\\\\KWIGGINS-VM1\\Test%20Database\\Campus%20Map\\";
					var url = baseUrl + buildingName;
					
					
					childList=[];
					httpRequest= $.ajax({
						url:url,
						async: false,
						crossDomain: true,
						xhrFields: {
							withCredentials: true
						},
						dataType: "json"
					});

						for (i=0; i<httpRequest.responseJSON.Items.length;i++){
							childEleName=httpRequest.responseJSON.Items[String(i)].Name;
							childList.push(childEleName);
						};

					//Adds JS click handler to each child element listed to open new display
					scope.childList= childList;
					scope.clickMe= function(clickEvent){
						clickerText=clickEvent.currentTarget.innerHTML;
						if (clickerText.substring(0,(clickerText.length-2))=="ChilledWater"){
							var number="43/";
							var meterType="Chilled%20Water";
						}
						else if (clickerText.substring(0,(clickerText.length-2))=="HotWater"){
							var number="42/";
							var meterType="Hot%20Water";
						}
						else if (clickerText.substring(0,(clickerText.length-2))=="Electricity"){
							var number="41/";
							var meterType="Electricity";
						}
						else if (clickerText.substring(0,(clickerText.length-2))=="Steam"){
							var number="44/";
							var meterType="Steam";
						}
						else {
							console.log('Error with Children JS Click Handler')
						}
						urlBeginning= "https://kwiggins-vm1/PIVision/#/Displays/";
						urlMiddle= "-Meter-Display?mode=kiosk&asset=\\\\KWIGGINS-VM1\\Test%20Database\\Campus%20Map\\";
						urlMiddleNext= "\\";
						fullUrl= urlBeginning + number + meterType + urlMiddle + buildingName + urlMiddleNext + clickerText;
						window.open(fullUrl);
					};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

               }
            }
        }
    }
    var definition = {
        typeName: 'childdropdown',
        datasourceBehavior: CS.Extensibility.Enums.DatasourceBehaviors.Single,
        visObjectType: symbolVis,
		iconUrl: '/Scripts/app/editor/symbols/ext/libraries/Icons/mit.png',
		inject: ['$http', 'timeProvider'],
        getDefaultConfig: function() {
    	    return {
    	        DataShape: 'Value',
    	        Height: 70,
                Width: 100,
                BackgroundColor: 'rgb(255,0,0)',
                TextColor: 'rgb(0,255,0)',
                ShowLabel: true,
                ShowTime: false
            };
        },
        configTitle: 'Format Symbol',
        StateVariables: [ 'MultistateColor' ]
    };

    CS.symbolCatalog.register(definition);
})(window.PIVisualization);