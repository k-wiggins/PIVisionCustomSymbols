(function (CS) {
    function symbolVis() { }
    CS.deriveVisualizationFromBase(symbolVis);

	symbolVis.prototype.init = function (scope, element , $http, timeProvider) {
        this.onDataUpdate = dataUpdate;

        function dataUpdate(data) {
            if(data) {
             scope.value = data.Value;
                scope.time = data.Time;
                if(data.Label) {
                    scope.label = data.Label;
               }
            }
        }
    };
    var definition = {
        typeName: 'simplevalue',
        datasourceBehavior: CS.Extensibility.Enums.DatasourceBehaviors.Single,
        visObjectType: symbolVis,
        getDefaultConfig: function() {
    	    return {
    	        DataShape: 'Value',
    	        Height: 150,
                Width: 150,
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