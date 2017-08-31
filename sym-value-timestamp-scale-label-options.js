// <copyright file="PIVisualization.sym-value-label-options.js" company="OSIsoft, LLC">
// Copyright © 2016 OSIsoft, LLC. All rights reserved.
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
// 777 Davis Street, Suite 250, San Leandro CA 94577
// </copyright>

/// <reference path="../_references.js" chutzpah-exclude="true" />

(function (PV) {
    'use strict';

    PV.SymValueTSScaleLabelOptions = (function() {
        var NameTypes = Object.freeze({
            Custom: 'C',
            Description: 'D',
            Full: 'F',
            Partial: 'P',
            Path: 'Path'
        });

        var getDefaultConfig = function (config) {
            return angular.merge({
                Description: true,
                NameType: 'F',
                CustomName: '',
                ShowLabel: true,
                ShowValue: true,
                ShowUOM: true,
                redTimeMinsAgo: 5,
            }, config);
        };

        var getLabelFromType = function (valueLabel, nameType) {
            switch (nameType) {
                case NameTypes.Description:
                    return valueLabel.description;
                case NameTypes.Full:
                    return valueLabel.label;
                case NameTypes.Partial:
                    var splits = valueLabel.label.split('|');
                    var ret = '';
                    if (splits.length > 0) {
                        ret = splits[splits.length - 1];
                    }
                    return ret;
                case NameTypes.Path:
                    return valueLabel.path;
                default:
                    return undefined;
            }
        };

        var init = function (scope) {
            scope.runtimeData.valueLabel = {
                displayName: '',
                description: '',
                label: '',
                path: ''
            };

            if (scope.symbol.DataSources && scope.symbol.DataSources.length > 0) {
                var dataItem = PV.Utils.parsePath(scope.symbol.DataSources[0]);
                scope.runtimeData.valueLabel.displayName = dataItem.label;
            }
        };

        var dataUpdate = function (scope, data) {
            if (data.Label && scope.runtimeData.valueLabel) {
                var valueLabel = scope.runtimeData.valueLabel;
                valueLabel.description = data.Description;
                valueLabel.label = data.Label;
                valueLabel.path = (data.Path || '').substr(3);

                if (scope.config.NameType === NameTypes.Custom) {
                    if (!scope.runtimeData.isEditingLabel) {
                        valueLabel.displayName = scope.config.CustomName;
                    }
                } else {
                    valueLabel.displayName = getLabelFromType(valueLabel, scope.config.NameType);
                }
            }
        };

        return { 
            NameTypes: NameTypes,
            getDefaultConfig: getDefaultConfig,
            init: init,
            getLabelFromType: getLabelFromType,
            dataUpdate: dataUpdate
        };
    }());
    
    angular.module(APPNAME)
        .service('SymValueTSScaleLabelOptions', SymValueTSScaleLabelOptions);

    function SymValueTSScaleLabelOptions() {
        var service = this;
        service.NameTypes = PV.SymValueTSScaleLabelOptions.NameTypes;
        service.getLabelFromType = PV.SymValueTSScaleLabelOptions.getLabelFromType;
        service.init = PV.SymValueTSScaleLabelOptions.init;
        service.dataUpdate = PV.SymValueTSScaleLabelOptions.dataUpdate;
    }
})(window.PIVisualization);