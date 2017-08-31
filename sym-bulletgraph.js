
//Window.PIVisualization = Window.PIVisualization || {};

(function (PV) {
    'use strict';

    function lGaugeVis() { }
    PV.deriveVisualizationFromBase(lGaugeVis);

    lGaugeVis.prototype.init = function (scope, elem, symValueLabelOptions, dataPump) {
        this.onDataUpdate = dataUpdate;

        // From data updates                
        var scalePositions = [];
        var scaleLabels = [];
        var indicatorValue = 0;
        var fontMetrics = scope.def.fontMetrics;

        symValueLabelOptions.init(scope);

        var originalValueSize = fontMetrics.charHeight * 6;    // Absolute Size that value label will take up
        var minimumBarHeight = 20;

        var updateVisualization;
        if (scope.symbol.SymbolType === 'verticalgauge') {
            scope.scaleLabelAlign = 'end';
            updateVisualization = updateVertical;
            scope.outerRectangle = {
                x: scope.config.StrokeWidth / 2,
                y: fontMetrics.charHeight,
                width: scope.position.width - scope.config.StrokeWidth,
                height: round(scope.availableGaugeHeight - fontMetrics.charHeight * 2)
            };
        } else {
            scope.scaleLabelAlign = 'middle';
            updateVisualization = updateHorizontal;
            scope.outerRectangle = {
                x: scope.config.StrokeWidth / 2,
                y: scope.config.StrokeWidth / 2,
                width: scope.position.width - scope.config.StrokeWidth,
                height: scope.availableGaugeHeight - scope.config.StrokeWidth
            };
        }

        this.onConfigChange = updateVisualization;
        this.onResize = updateVisualization;

        scope.fontSize = 15;

        scope.symValue = '...';
        scope.valueMetaData = { units: '' };

        Object.defineProperty(scope, 'availableGaugeHeight', {
            get: function () {
                return scope.position.height - scope.valueSize;
            }
        });

        updateReset();

        function dataUpdate(data) {
            if (data) {
                indicatorValue = data.IsGood !== false ? data.Indicator : 100;

                if (indicatorValue > 100) {
                    indicatorValue = 100;
                } else if (indicatorValue < 0) {
                    indicatorValue = 0;
                }

                scope.symTime = data.Time;
                scope.symValue = data.Value;
                scope.IsGood = data.IsGood;

                // Value panel at top of gauge
                if (data.Label) {
                    symValueLabelOptions.dataUpdate(scope, data);
                    scope.valueMetaData = { Path: PV.Utils.parseTooltip(data.Path), Units: data.Units };
                }

                scope.tooltip = PV.Utils.generateTooltip(scope);

                var updateIndicatorOnly = !!scope.outerRectangle
                    && data.ValueScalePositions.length === scalePositions.length
                    && data.ValueScaleLabels.length === scaleLabels.length
                    && data.ValueScalePositions.join(',') === scalePositions.join(',')
                    && data.ValueScaleLabels.join(',') === scaleLabels.join(',');

                scalePositions = data.ValueScalePositions;
                scaleLabels = data.ValueScaleLabels;

                updateVisualization(updateIndicatorOnly);
            }
        }
        function originalGaugeHeight() {
            return scope.position.height - originalValueSize;
        }

        function updateReset() {
            var gaugeHeight = originalGaugeHeight();
            var labelCount = 0;
            if(scope.config.ShowValue)
                labelCount ++;
            if(scope.config.ShowLabel)
                labelCount ++;
            if(scope.config.ShowComparisonLabel)
                labelCount ++;
            if (gaugeHeight <= minimumBarHeight) {
                scope.valueSize = 0;
            } else if (labelCount === 0) {
                scope.valueSize = 0;
            } else if (labelCount === 1) {
                scope.valueSize = originalValueSize / 3;
            } else if (labelCount === 2) {
                scope.valueSize = originalValueSize * 2 / 3;
            } else {
                scope.valueSize = originalValueSize;
            }

            // Reset scale tick marks and labels
            scope.scaleLabels = [];
            scope.scaleTicks = '';
        }

        function round(num) {
            return Math.round(num * 10) / 10;
        }

        function updateVertical(updateIndicatorOnly) {
            if (updateIndicatorOnly !== true) {
                updateReset();

                var height = scope.availableGaugeHeight - fontMetrics.charHeight * 2;
                var maxLength = 0;
                var halfStrokeWidth = scope.config.StrokeWidth / 2;
                var scaleWidth = halfStrokeWidth;

                // Build the array of scale labels and catch the max label length
                scaleLabels.forEach(function (label, i) {
                    maxLength = Math.max(maxLength, label.length);
                    scope.scaleLabels[i] = {
                        value: scaleLabels[i],
                        y: round((100 - scalePositions[i]) / 100 * height + fontMetrics.charHeight)
                    };
                });

                // Remove overlapping labels
                if (scope.scaleLabels.length > 0) {
                    PV.Scales.fixVerticalScaleOverlap(scope.scaleLabels, fontMetrics.charHeight);
                }

                // If there is anything to show...
                if (scope.scaleLabels.length > 0) {
                    // Calculate width of label and width of scale
                    var labelX = maxLength * fontMetrics.charWidth;
                    scaleWidth = labelX + 12;   // tick mark
                    if (scaleWidth > scope.position.width - 10) {
                        // Scale too wide - hide it
                        scope.scaleLabels.length = 0;
                        scaleWidth = halfStrokeWidth;
                    } else {
                        // Set scale width and create tick marks for labels that remain
                        scope.scaleLabels.forEach(function (label) {
                            scope.scaleTicks += 'M' + scaleWidth + ' ' + label.y + ' l-10 0 ';
                            label.x = round(maxLength * fontMetrics.charWidth);
                            // Center label vertically on tick mark
                            label.y += fontMetrics.charMidHeight;
                        });
                    }
                }

                var outerRectangleTop, outerRectangleHeight;
                if (scope.scaleLabels.length > 0 || (dataPump.isRunning && scope.scaleLabels.length === 0 && scope.valueSize !== 0)) {
                    outerRectangleTop = fontMetrics.charHeight;
                    outerRectangleHeight = round(height);
                }
                else {
                    outerRectangleTop = halfStrokeWidth;
                    outerRectangleHeight = round(scope.availableGaugeHeight - scope.config.StrokeWidth);
                }

                scope.outerRectangle = {
                    x: round(scaleWidth),
                    y: outerRectangleTop,
                    height: outerRectangleHeight,
                    width: round(scope.position.width - scaleWidth - halfStrokeWidth)
                };
            }

            scope.indicatorRectangle = {
                x: round(scope.outerRectangle.x),
                width: scope.outerRectangle.width
            };

            if (isInverted()) {
                scope.indicatorRectangle.y = scope.outerRectangle.y;
                scope.indicatorRectangle.height = round(scope.outerRectangle.height * (100 - indicatorValue) / 100);
            } else {
                scope.indicatorRectangle.y = round(scope.outerRectangle.y + (scope.outerRectangle.height) * (1 - indicatorValue / 100));
                scope.indicatorRectangle.height = round(scope.outerRectangle.height * indicatorValue / 100);
            }
        }

        function updateHorizontal(updateIndicatorOnly) {
            if (updateIndicatorOnly !== true) {
                updateReset();

                // Determine padding to either side of scale by getting longer of first and last label, at least 3 characters
                var padding = scaleLabels.length > 0
                    ? Math.max(Math.max(scaleLabels[0].length, scaleLabels[scaleLabels.length - 1].length), 3) * fontMetrics.charWidth
                    : 0;
                var scaleWidth = scope.position.width - padding;
                var scaleLeft = padding / 2;
                var halfStrokeWidth = scope.config.StrokeWidth / 2;

                // Build label binding array, determine x coordinate and label
                scaleLabels.forEach(function (label, i) {
                    scope.scaleLabels[i] = {
                        value: scaleLabels[i],
                        x: round(scaleLeft + scalePositions[i] / 100 * scaleWidth)
                    };
                });

                if (scope.scaleLabels.length > 0) {
                    PV.Scales.fixHorizontalValueScaleOverlap(scope.scaleLabels, scope.position.width, fontMetrics.charWidth);
                }

                var scaleHeight = 0;
                if (scope.scaleLabels.length > 0) {
                    // Determine top of scale
                    scaleHeight = fontMetrics.charHeight * 2;
                    var scaleY = round(scope.availableGaugeHeight - scaleHeight);
                    if (scaleY < fontMetrics.charHeight) {
                        // Won't fit - remove all labels and hide scale
                        scope.scaleLabels.length = 0;
                    } else {
                        // Build tick marks for remaining labels
                        scope.scaleLabels.forEach(function (label) {
                            scope.scaleTicks += 'M' + label.x + ' ' + scaleY + ' l0 8 ';
                            label.y = scaleY + (fontMetrics.charHeight * 2);
                        });
                    }
                }

                // Nothing fits - recover room for the bar
                if (scope.scaleLabels.length === 0) {
                    scaleHeight = 0;
                    scaleLeft = halfStrokeWidth;
                    scaleWidth = scope.position.width - scope.config.StrokeWidth;
                }

                scope.outerRectangle = {
                    x: round(scaleLeft),
                    y: halfStrokeWidth,
                    width: round(scaleWidth),
                    height: scope.availableGaugeHeight - scaleHeight - scope.config.StrokeWidth
                };
            }//end !indicator only part

            scope.goodRangeRectangle = {
                x: scope.outerRectangle.x,
                y: scope.outerRectangle.y,
                height: round(scope.outerRectangle.height),
                width: round(scope.outerRectangle.width * scope.config.GoodRange / 100)
            };

            scope.warningRangeRectangle = {
                x: scope.outerRectangle.x,
                y: scope.outerRectangle.y,
                height: round(scope.outerRectangle.height),
                width: round(scope.outerRectangle.width * scope.config.WarningRange / 100)
            };

            scope.badRangeRectangle = {
                x: scope.outerRectangle.x,
                y: scope.outerRectangle.y,
                height: round(scope.outerRectangle.height),
                width: round(scope.outerRectangle.width * scope.config.BadRange / 100)
            };

            scope.comparisonRectangle = {
                x: round(scope.outerRectangle.width * scope.config.ComparisonValue / 100 -5),
                y: (scope.outerRectangle.y + scope.outerRectangle.height) / 4,
                height: round(scope.outerRectangle.height * .5),
                width: 5
            };

            scope.indicatorRectangle = {
                y: (scope.outerRectangle.y + scope.outerRectangle.height) / 3,
                height: round(scope.outerRectangle.height / 3)
            };

            if (isInverted()) {
                scope.indicatorRectangle.width = round(scope.outerRectangle.width * (100 - indicatorValue) / 100);
                scope.indicatorRectangle.x = scope.outerRectangle.x + scope.outerRectangle.width - scope.indicatorRectangle.width;
            } else {
                scope.indicatorRectangle.x = scope.outerRectangle.x;
                scope.indicatorRectangle.width = round(scope.outerRectangle.width * indicatorValue / 100);
            }
        }//end update Horizontal

        function isInverted() {
            var settings = scope.config.ValueScaleSettings;
            return !!settings && settings.MinType === 2 && settings.MaxType === 2 && settings.MinValue > settings.MaxValue;
        }
    };

    // Register symbols in the catalog
    [{
        typeName: 'bulletgraphvert',
        displayName: "Bullet Graph Vertical",
        iconUrl: 'scripts/app/editor/symbols/ext/libraries/Icons/bulletgraph-vert.png',
        getDefaultConfig: function () {
            return PV.SymValueLabelOptions.getDefaultConfig({
                DataShape: 'Gauge',
                Height: 300,
                Width: 105,
                Fill: 'rgb(0, 162, 232)',
                Background: 'rgba(255,255,255,0)',
                Stroke: 'white',
                StrokeWidth: '3',
                ValueStroke: 'white',
                ShowComparisonLabel: true,
                ShowComparisonValue: true,
                ComparisonValue: 90,
                GoodRange:70,
                WarningRange:40,
                BadRange:20
            });
        },
        symbolFamily: 'gauge',
        formatMap: { IndicatorColor: 'Fill', GaugeBackgroundColor: 'Background', LineColor: 'Stroke', LineWidth: 'StrokeWidth', ValueColor: 'ValueStroke' }
    }, {
        typeName: 'bulletgraphhoriz',
        displayName: "Bullet Graph Horizontal",
        iconUrl: 'scripts/app/editor/symbols/ext/libraries/Icons/bulletgraph.png',
        getDefaultConfig: function () {
            return PV.SymValueLabelOptions.getDefaultConfig({
                DataShape: 'Gauge',
                Height: 100,
                Width: 300,
                Fill: 'rgb(0, 162, 232)',
                Background: 'rgba(255,255,255,0)',
                Stroke: 'white',
                StrokeWidth: '3',
                ValueStroke: 'white',
                ShowComparisonLabel: true,
                ShowComparisonValue: true,
                ComparisonValue: 90,
                GoodRange:70,
                WarningRange:40,
                BadRange:20
            });
        },
        symbolFamily: 'gauge',
        formatMap: { IndicatorColor: 'Fill', GaugeBackgroundColor: 'Background', LineColor: 'Stroke', LineWidth: 'StrokeWidth', ValueColor: 'ValueStroke' }
    }].forEach(function (def) {
        def.inject = ['symValueLabelOptions', 'dataPump'];
        def.visObjectType = lGaugeVis;
        def.templateUrl = 'scripts/app/editor/symbols/ext/sym-bulletgraph-template.html';
        def.datasourceBehavior = PV.Extensibility.Enums.DatasourceBehaviors.Single;
        def.StateVariables = ['Fill', 'Blink'];
        def.fontMetrics = {       // Assume scale font is Ariel 12 pt
            charHeight: 10,       // Height of digit in label
            charMidHeight: 4,     // Vertical mid-point of a digit, slightly higher than half-way because of font descenders
            charWidth: 6.3        // Average width of a character in the scale
        };
        def.themes = {
            reverse: {
                Stroke: 'black',
                ValueStroke: 'black'
            }
        };
        def.supportsCollections = true;

        def.configTemplateUrl = 'scripts/app/editor/symbols/ext/sym-bulletgraph-config.html';
        def.configTitle = PV.ResourceStrings.FormatGaugeOption;
        def.configInit = PV.GaugeConfig.init;
        def.configChangeScaleSettings = PV.GaugeConfig.changeScaleSettings;

        PV.symbolCatalog.register(def);
    });

})(window.PIVisualization);