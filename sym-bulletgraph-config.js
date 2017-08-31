window.PIVisualization = window.PIVisualization || {};

(function (PV) {
    'use strict';

    PV.GaugeConfig = (function () {
        var update = function () { };

        function init(scope) {
            update = scope.update || update;            
        }

        function changeScaleSettings(config, runtimeData) {
            if (config.ValueScaleSettings) {
                delete config.ValueScaleSettings;
            } else {
                config.ValueScaleSettings = {
                    MinType: 2,
                    MinValue: runtimeData.metaData.Minimum,
                    MaxType: 2,
                    MaxValue: runtimeData.metaData.Maximum
                };
            }
            update();
        }

        return { init: init, changeScaleSettings: changeScaleSettings };
    }());

})(window.PIVisualization);