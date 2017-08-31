(function (PV) {  
    'use strict';  
	function symbolVis() { }
    PV.deriveVisualizationFromBase(symbolVis);
	
    var contents;  
    var def = {  
        typeName: 'DownloadValues',  
        iconUrl: '/Scripts/app/editor/symbols/ext/libraries/Icons/download.svg',  
        datasourceBehavior: PV.Extensibility.Enums.DatasourceBehaviors.Multiple,
		visObjectType: symbolVis,		
        getDefaultConfig: function () {  
            return {  
                DataShape: 'TimeSeries',  
                DataQueryMode: PV.Extensibility.Enums.DataQueryMode.ModeEvents,  
                Height: 50,  
                Width: 200,  
				Intervals: 10000,
                TextColor: 'rgb(255,255,255)',  
            };  
        },  
    };  
  
    symbolVis.prototype.init= function init(scope, elem) { 
		this.onDataUpdate= dataUpdate;
        var container = elem.find('#Download')[0];  
        if (scope.symbol.DataSources) {  
                scope.symbol.DataSources.forEach(function (item) {  
                    item = item ? item.toString() : '';                         // Make sure it's a string  
					var path = item;  
                    item = item.substr(item.lastIndexOf('\\') + 1) || item;     // strip out server and database  
                    item = item.substr(0, item.indexOf('?')) || item;           // remove ID after last '?'  
                    scope.label = item; 
                });  
            }  
          
        function dataUpdate(data) {  
            if(data) {  
                scope.contents= scope.label + "," + scope.symbol.DataSources[0] + "\r\n";  
                data.Data[0].Values.forEach(  
                    function(item) {  
                    var time = item.Time;  
                    var val = item.Value;  
                    scope.contents = scope.contents + time + "," + val + "\r\n";  
                });  
            }  
        }  
  
        scope.download = function() {  
            var datacsv = new Blob([scope.contents]);  
            container.href = URL.createObjectURL(datacsv);  
        };  
        //return { dataUpdate: onUpdate };  
    }  
    PV.symbolCatalog.register(def);  
})(window.PIVisualization);  