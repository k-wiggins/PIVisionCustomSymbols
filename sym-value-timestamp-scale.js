// <copyright file="PIVisualization.sym-value.js" company="OSIsoft, LLC">
// Copyright © 2014-2016 OSIsoft, LLC. All rights reserved.
// THIS SOFTWARE CONTAINS CONFIDENTIAL INFORMATION AND TRADE SECRETS OF OSIsoft, LLC.
// USE, DISCLOSURE, OR REPRODUCTION IS PROHIBITED WITHOUT THE PRIOR EXPRESS WRITTEN
// PERMISSION OF OSIsoft, LLC.
//
// RESTRICTED RIGHTS LEGEND
// Use, duplication, or disclosure by the Government is subject to restrictions
// as set forth in subparagraph (c)(1)(ii) of the Rights in Technical Data and
// Computer Software clause at DFARS 252.227.7013
//
// OSIsoft, LLC.
// 1600 Alvarado Street, San Leandro, CA 94577
// </copyright>

/// <reference path="../_references.js" />

window.PIVisualization = window.PIVisualization || {};
window.PIVisualization.ClientSettings = window.PIVisualization.ClientSettings || {};

(function (PV) {
    'use strict';
    function valTimestampScale() { }
    PV.deriveVisualizationFromBase(valTimestampScale);

    valTimestampScale.prototype.init = function (scope, elem, SymValueTSScaleLabelOptions) {
        this.onResize = resize;
        this.onConfigChange = configChange;
        this.onDataUpdate = dataUpdate;
        var that = this;

        scope.symTime = 'Loading...';
        scope.symTimeColor = 'rgba(255,255,255,0)';
        scope.symValue = '...';
        scope.valueMetaData = { Units: '' };

        SymValueTSScaleLabelOptions.init(scope);

        var fontMetrics = scope.def.fontMetrics;
        var indicatorMultiplier = 0.75;
        var indicatorFontMultiplier = 0.75;
        scope.differentialText = '...';
        scope.IndicatorFill = scope.config.Stroke;
        scope.targetText = '...';

        scope.indicatorPosition = {
            left: undefined,
            width: undefined,
            points: '0,0 0,0 0,0',
            alternateStatePath: ''
        };

        var allLines = elem.find('.text-symbol-sizing-line');
        var shownLines;
        var direction;
        var diffValue = '...';
        var diffPercent = '...';
        var fontSizingObject = {};

        Object.defineProperty(fontSizingObject, 'diffWidth', {
            get: function () {
                return scope.config.ShowDifferential ? 1.1 * fontMetrics.charWidth * scope.indicatorFontSize / 12 * scope.differentialText.toString().length : 0;
            }
        });

        Object.defineProperty(fontSizingObject, 'targetWidth', {
            get: function () {
                return scope.config.ShowTarget ? 1.1 * fontMetrics.charWidth * scope.indicatorFontSize / 12 * scope.targetText.toString().length : 0;
            }
        });

        function setupResizingLines() {
            shownLines = [];
            if (scope.config.ShowLabel)
                shownLines.push(allLines[0]);
            if (scope.config.ShowValue) {
                shownLines.push(allLines[1]);
            }

            if (scope.config.ShowTime)
                shownLines.push(allLines[2]);
        }

        setupResizingLines();

        scope.runtimeData.onDisplayNameChanged = function () {
            resize();
        };

        function calculateColorBasedOnStaleness(time, config) {
            // console.log(time);
            //set a default for the minutes ago, sometimes config is null
            var redTimeMinutesAgo = 5;
            if(config && config.redTimeMinsAgo){
                redTimeMinutesAgo = config.redTimeMinsAgo;
            }
            //for now, recent value is just current time
            //TODO configurable (ie: green if within 5 mins)
            var newValTime = Date.now();
            //uses config value for minutes ago
            //where a value is considered stale
            var oldValTime = Date.now() - (1000*60*redTimeMinutesAgo);//1day 86400000;
            var time = Date.parse(time);
            //console.log('Value is '+(Date.now()-time)/1000 + ' Seconds ago');
            var scale = 0;
            if(time >= newValTime)
            {
                scale = 0;
            }
            if (time <= oldValTime){
                scale = 1;
            }
            else{
                scale = 1- ((time-oldValTime)/(newValTime-oldValTime));
            }

            var red = 0;
            var green = 1;
            var blue = 0.0;
            if(scale <= .5){
                red = 2*scale;
            }
            else {
                red = 1.0;
                green = 1.0 - 2 * (scale*0.5);
            }
            // if 0<=power<0.5:        #first, green stays at 100%, red raises to 100%
            //     green = 1.0
            //     red = 2 * power
            // if 0.5<=power<=1:       #then red stays at 100%, green decays
            //     red = 1.0
            //     green = 1.0 - 2 * (power-0.5)
            var returnval = 'rgba('+parseInt(red*255)+','+parseInt(green*255)+',0,1)';
            return returnval;
        }

        function dataUpdate(data) {
            var valueLabel = scope.runtimeData.valueLabel;
            if (data && data.Time) {
            scope.symTimeColor = calculateColorBasedOnStaleness(data.Time, this.scope.config);
            }
            if (data && (scope.symTime !== data.Time ||

                scope.symValue !== data.Value ||
                (data.Description && valueLabel.description !== data.Description) ||
                (data.Label && valueLabel.label !== data.Label) ||
                (data.Path && valueLabel.path !== data.Path.slice(3)) ||
                (data.TargetData && data.TargetData.Target !== scope.target)
            )) {

                scope.symTime = data.Time;
                scope.symValue = data.Value;
                scope.symTimeColor = calculateColorBasedOnStaleness(data.Time);

                // Metadata received on first update, periodically afterward
                if (data.Label) {
                    SymValueTSScaleLabelOptions.dataUpdate(scope, data);
                    scope.valueMetaData = { Path: PV.Utils.parseTooltip(data.Path), Units: data.Units || '' };
                }

                if (data.TargetData) {
                    if (data.TargetData.TargetErrorCode) {
                        scope.target = PV.ResourceStrings.ErrorCode + ' ' + data.TargetData.TargetErrorCode + ', ' + data.TargetData.TargetErrorDescription;
                        scope.targetText = PV.ResourceStrings.TooltipTarget + scope.target;
                        direction = PV.ResourceStrings.Error;
                        diffValue = '...';
                        diffPercent = '...';
                    }

                    if (data.TargetData.Target) {
                        scope.target = data.TargetData.Target;
                        scope.targetText = PV.ResourceStrings.TooltipTarget + scope.target;
                    }

                    if (data.TargetData.TargetDirection) {
                        direction = data.TargetData.TargetDirection;
                    }

                    if (data.TargetData.TargetDiffValue) {
                        diffValue = data.TargetData.TargetDiffValue;
                    }

                    if (data.TargetData.TargetDiffPercent) {
                        diffPercent = data.TargetData.TargetDiffPercent;
                    }

                    scope.diffValue = diffValue;
                    scope.diffPercent = diffPercent;
                }

                scope.tooltip = PV.Utils.generateTooltip(scope);

                resize();
            }
        }

        function configChange(newConfig, oldConfig) {
            resize();
            if (!!newConfig.ShowIndicator && !oldConfig.ShowIndicator) {
                scope.$emit('refreshDataForChangedSymbols');
            }
        }

        function resize() {
            setupResizingLines();
            adjustFontWidthForIndicator();
            that.autoSizeWidth(shownLines);
        }

        if (that.onAutoResizeComplete) {
            var currentFunction = that.onAutoResizeComplete;
            that.onAutoResizeComplete = function () {
                currentFunction();
                updateIndicator();
            };
        }
        else {
            that.onAutoResizeComplete = updateIndicator;
        }

        function adjustFontWidthForIndicator() {

            if (!scope.config.ShowLabel && !scope.config.ShowTime && !scope.config.ShowValue) {
                indicatorFontMultiplier = 1;
            }
            else {
                indicatorFontMultiplier = 0.75;
            }

            if (scope.config.DifferentialType === 'percent') {
                scope.differentialText = diffPercent;
            }
            else if (scope.config.DifferentialType === 'value') {
                scope.differentialText = diffValue;
            }

            var height;
            var fontHeight;
            if (shownLines.length) {
                fontHeight = $(shownLines[0]).height() * indicatorFontMultiplier;
            } else {
                fontHeight = scope.position.height * indicatorFontMultiplier;
            }

            if (shownLines.length) {
                height = $(shownLines[0]).height();
                if (height > scope.position.height * indicatorMultiplier) {
                    height = scope.position.height * indicatorMultiplier;
                }
            } else {
                height = scope.position.height;
            }

            if (scope.config.ShowTarget) {
                if (height > scope.position.height / 2) {
                    height = scope.position.height / 2;
                }
                if (fontHeight > scope.position.height / 2 * indicatorFontMultiplier) {
                    fontHeight = scope.position.height / 2 * indicatorFontMultiplier;
                }
            }
            scope.indicatorFontSize = 12 * fontHeight / (1.35 * fontMetrics.charHeight);

            scope.widthAdjustment = scope.config.ShowIndicator ? (Math.max(height + (fontSizingObject.diffWidth), (fontSizingObject.targetWidth))) : 0;
        }

        function updateIndicator() {
            if (scope.position.width && scope.config.ShowIndicator) {
                var height;

                if (shownLines.length) {
                    height = $(shownLines[0]).height();
                    if (height > scope.position.height * indicatorMultiplier) {
                        height = scope.position.height * indicatorMultiplier;
                    }
                } else {
                    height = scope.position.height;
                }

                var top;

                if (scope.config.ShowTarget) {
                    if (height > scope.position.height / 2) {
                        height = scope.position.height / 2;
                    }
                    top = scope.position.height / 4 - scope.indicatorPosition.height / 2;

                }
                else {
                    top = scope.position.height / 2 - scope.indicatorPosition.height / 2;
                }

                top = top < 0 ? 0 : top;

                scope.indicatorPosition = {
                    width: height,
                    height: height,
                    top: top
                };

                var leftStart = scope.position.width - scope.widthAdjustment;
                var topGreaterThanBottom = false;
                if (scope.indicatorPosition.width + fontSizingObject.diffWidth >= fontSizingObject.targetWidth) {
                    topGreaterThanBottom = true;
                }
                if (scope.config.ShowDifferential) {
                    if (topGreaterThanBottom) {
                        scope.indicatorPosition.left = leftStart;
                    }
                    else {
                        scope.indicatorPosition.left = scope.position.width - scope.widthAdjustment * 0.75 - scope.indicatorPosition.width / 2;
                    }
                }
                else {
                    scope.indicatorPosition.left = scope.position.width - scope.widthAdjustment / 2 - scope.indicatorPosition.width / 2;
                }

                generateIndicatorPoints(direction);

                if (direction) {
                    if (direction === 'Up') {
                        scope.IndicatorFill = scope.config.IndicatorFillUp;
                    }
                    else if (direction === 'Down') {
                        scope.IndicatorFill = scope.config.IndicatorFillDown;
                    }
                    else {
                        scope.IndicatorFill = scope.config.IndicatorFillNeutral;
                    }
                }

                if (scope.config.ShowDifferential && scope.position.width > 0) {
                    if (shownLines.length) {
                        height = $(shownLines[0]).height() * indicatorFontMultiplier;
                    } else {
                        height = scope.position.height * indicatorMultiplier;
                    }

                    if (scope.config.ShowTarget) {
                        if (height > scope.position.height * indicatorFontMultiplier / 2) {
                            height = scope.position.height * indicatorFontMultiplier / 2;
                        }
                    }

                    scope.differentialPosition = {
                        width: fontSizingObject.diffWidth,
                        height: height

                    };
                    scope.differentialPosition.top = scope.indicatorPosition.top + scope.indicatorPosition.height / 2 - scope.differentialPosition.height / 2;
                    scope.differentialPosition.top = scope.differentialPosition.top < 0 ? 0 : scope.differentialPosition.top;

                    if (topGreaterThanBottom) {
                        scope.differentialPosition.left = leftStart + scope.indicatorPosition.width;
                    } else {
                        scope.differentialPosition.left = scope.position.width - scope.widthAdjustment * 0.25 - scope.differentialPosition.width / 2;
                    }

                    if (scope.differentialPosition.left + scope.differentialPosition.width > scope.position.width) {
                        scope.differentialPosition.left = scope.position.width - scope.differentialPosition.width;
                    }
                }

                if (scope.config.ShowTarget && scope.position.width > 0) {
                    if (shownLines.length) {
                        height = $(shownLines[0]).height() * indicatorFontMultiplier;
                    } else {
                        height = scope.position.height * indicatorFontMultiplier / 2;
                    }

                    if (height > scope.position.height * indicatorFontMultiplier / 2) {
                        height = scope.position.height * indicatorFontMultiplier / 2;
                    }

                    scope.targetPosition = {
                        left: scope.position.width - scope.widthAdjustment,
                        width: fontSizingObject.targetWidth,
                        height: height,
                        top: scope.position.height * 0.75 - height / 2
                    };

                    if (topGreaterThanBottom) {
                        scope.targetPosition.left = scope.position.width - scope.widthAdjustment / 2 - scope.targetPosition.width / 2;
                    }

                    if (shownLines.length) {
                        var shownLinesHeight = $(elem.find('.value-symbol-portion-text')).height();
                        if (scope.targetPosition.top + scope.targetPosition.height > shownLinesHeight) {
                            scope.targetPosition.top = shownLinesHeight - scope.targetPosition.height;

                        }
                    }
                }
            }
        }

        function generateIndicatorPoints(direction) {
            if (direction) {
                var center = scope.indicatorPosition.width / 2;
                var point1X, point1Y,
                    point2X, point2Y,
                    point3X, point3Y;

                point1X = 0;
                point2X = center;
                point3X = scope.indicatorPosition.width;
                if (direction === 'Up' || direction === 'Down') {

                    if (direction === 'Up') {
                        point1Y = scope.indicatorPosition.height;
                        point3Y = scope.indicatorPosition.height;
                        point2Y = 0;
                    }
                    else if (direction === 'Down') {
                        point1Y = 0;
                        point3Y = 0;
                        point2Y = scope.indicatorPosition.height;
                    }

                    scope.indicatorPosition.points = point1X + ',' + point1Y + ' ' + point2X + ',' + point2Y + ' ' + point3X + ',' + point3Y;
                    scope.indicatorPosition.alternateStatePath = '';
                }
                else if (direction === 'Neutral') {
                    scope.indicatorPosition.alternateStatePath = 'M' + point1X + ' ' + (scope.indicatorPosition.height / 2) + ' L' + point3X + ' ' + (scope.indicatorPosition.height / 2);
                    scope.indicatorPosition.points = '';
                }
                else if (direction === 'Error') {
                    scope.indicatorPosition.alternateStatePath = 'M' + point1X + ' ' + 0 + ' L' + point3X + ' ' + scope.indicatorPosition.height;
                    scope.indicatorPosition.alternateStatePath += 'M' + point1X + ' ' + scope.indicatorPosition.height + ' L' + point3X + ' ' + 0;
                }
            }

            return '';
        }
    };

    function loadConfig(config) {
        if (config) {
            if (config.Width !== undefined) {
                delete config.Width;
            }

            if (config.CustomName && config.CustomName.length > PV.ClientSettings.MaxTextSymbolInput) {
                config.CustomName = config.CustomName.substr(0, PV.ClientSettings.MaxTextSymbolInput);
            }
        }
        return true;
    }

    var def = {
        typeName: 'valuetimestampscale',
        displayName: "Value TimeStamp Scale",
        datasourceBehavior: PV.Extensibility.Enums.DatasourceBehaviors.Single,
        iconUrl: 'Scripts/app/editor/symbols/ext/libraries/Icons/value-timestamp-scale.png',
        getDefaultConfig: function () {
            var config = PV.SymValueTSScaleLabelOptions.getDefaultConfig({
                DataShape: 'Value', // can only be Value, Gauge, Trend, Table, TimeSeries
                Height: 60,
                Fill: 'rgba(255,255,255,0)',
                Stroke: 'rgba(119,136,153,1)',
                ValueStroke: 'rgba(255,255,255,1)',
                ShowTime: true,
                IndicatorFillUp: 'white',
                IndicatorFillDown: 'white',
                IndicatorFillNeutral: 'gray',
                ShowDifferential: true,
                DifferentialType: 'percent',
                ShowIndicator: false,
                ShowValue: true,
                ShowTarget: true
            });
            return config;
        },
        themes: {
            reverse: {
                ValueStroke: 'black',
                IndicatorFillUp: 'black',
                IndicatorFillDown: 'black'
            }
        },
        loadConfig: loadConfig,
        templateUrl: 'scripts/app/editor/symbols/ext/sym-value-timestamp-scale-template.html',
        resizerMode: 'AutoWidth',
        StateVariables: ['Fill', 'Blink'],
        inject: ['SymValueTSScaleLabelOptions'],
        visObjectType: valTimestampScale,
        configTemplateUrl: 'scripts/app/editor/symbols/ext/sym-value-timestamp-scale-config.html',
        configTitle: PV.ResourceStrings.FormatValueOption,
        formatMap: { BackgroundColor: 'Fill', TextColor: 'Stroke', ValueColor: 'ValueStroke' },
        supportsCollections: true
    };
    def.fontMetrics = {       // Assume scale font is Ariel 12 pt
        charHeight: 10,       // Height of digit in label
        charMidHeight: 4,     // Vertical mid-point of a digit, slightly higher than half-way because of font descenders
        charWidth: 6.3        // Average width of a character in the scale
    };
    PV.symbolCatalog.register(def);

})(window.PIVisualization);