
(function (PV) {
    function symbolVis() { }
    PV.deriveVisualizationFromBase(symbolVis);

    var definition = {
        typeName: 'histogram',
        displayName: 'Attribute Comparison',
        iconUrl: 'scripts/app/editor/symbols/ext/libraries/Icons/histogram.png',
        datasourceBehavior: PV.Extensibility.Enums.DatasourceBehaviors.Single,
        inject: ['$http', 'timeProvider'],
        visObjectType: symbolVis,
        getDefaultConfig: function() {
            return {
                DataShape: 'Value',
                Height: 250, 
                Width: 480,
                BackgroundColor: 'rgb(0,0,0)', //black
                ForegroundColor: 'rgb(255,255,255)', //white
                HighlightColor: 'rgb(255,0,0)', //red
                BinNumber: 20,
                StaleCheck: true,
                StaleRange: 48,
            };
        },
        configTitle: 'Format Histogram Comparison',
        init: symbolVis.prototype.init,
    };

    symbolVis.prototype.init = function(scope, element, $http, timeProvider) {
        this.onDataUpdate = dataUpdate;
        this.onResize = resize;
        this.timeProvider = timeProvider;

        scope.data = [];
        scope.runtimeData.assetList = [];
        scope.runtimeData.template = {};
        scope.runtimeData.attributeList = [];

        var config = scope.config;
        var piWebApiRESTService = {};
        var baseUrl = 'https://localhost/piwebapi';
        var res = {};
        scope.runtimeData.selectedElement = "";
        scope.runtimeData.selectedAttribute = "";
        var selectedUnits = "";
        var endTime = ""
		
        //Loads d3-tip  library as soon as PI Vision loads
		
		$(window).load(function(){
			var newLibrary = document.createElement('script');
			newLibrary.setAttribute("type", "text/javascript");
			newLibrary.setAttribute("src", "https://labratrevenge.com/d3-tip/javascripts/d3.tip.v0.6.3.js");
			(document.getElementsByTagName("svg")[0]/* || document.documentElement */).appendChild(newLibrary);
		});
		
        var svg = element.find('svg')[0];
        var id = 'hist_' + Math.random().toString(36).substr(2, 16);
        svg.id = id;

        function dataUpdate(data){
            if(data) {
                if(data.Label) {
                    scope.label = data.Label;
                    var splited = scope.label.split("|");
                    if(splited.length == 2) {
                        scope.runtimeData.selectedElement = splited[0];
                        scope.runtimeData.selectedAttribute = splited[1];
                    }
                    selectedUnits = data.Units;
                } 
                endTime = data.Time;

                /* If the data hasn't been updated recently and the Now button is clicked,
                    the last recorded timestamp is used when the current timestamp is expected.
                    The following if statement works around that*/
                if(new Date(endTime) != new Date(this.timeProvider.getServerEndTime())) {
                    endTime = this.timeProvider.getServerEndTime();
                }
                piWebApiRESTService.sendBatchRequest(constructDataBatch(scope.runtimeData.selectedElement, scope.runtimeData.selectedAttribute, endTime)).then(function(x){
					scope.data = parseJSONData(x);
                    scope.runtimeData.assetList = scope.data;
                    initd3(id);
                });
            }
        }
        
        var batchSingle = function(method, resource, parentIds, parameters) {
            var single = {};
            single.Method = method;
            single.RequestTemplate = {};
            single.RequestTemplate.Resource = resource;
            if (parentIds != undefined) single.ParentIds = parentIds;
            if (parameters != undefined) single.Parameters = parameters;
            return single;
        }

        //piwebapi call for data
        function constructDataBatch(element, attribute, endTime) {
            var batchContent = {};
        
            //find template of current attribute
            batchContent['QueryElement'] = batchSingle(
                'GET',
                baseUrl + '/search/query?q=name:'+element+'&fields=name;paths;template;links;'
            )
			//////////////////////////////////////////////////////////////////////////////////////////
            /* Query Data */
            //compare pivision data path with webapi path for correct element
            batchContent['QueryTemplate'] = batchSingle(
                'GET',
                baseUrl + '/search/query?q=afelementtemplate:"{0}"&fields=links;name;&count=1000',
                ["QueryElement"],
                ["$.QueryElement.Content.Items[0].Content.Items[0].Template.Name"]
            )

            //another piwebapi call for other elements with same template
            batchContent['GetAttributes'] = batchSingle(
                'GET',
                '{0}/attributes?nameFilter='+attribute+'&selectedFields=Items.links;Items.Name',
                ["QueryTemplate"],
                ["$.QueryTemplate.Content.Items[*].Content.Items[*].Links.Self"]
            )
			//////////////////////////////////////////////////////////////////////////////////////////
            //add query for current attribute
            batchContent['GetValue'] = batchSingle(
                'GET',
                '{0}?time='+ endTime,
                ["GetAttributes"],
                ["$.GetAttributes.Content.Items[*].Content.Items[*].Links.Value"]
            )
            
            //if staleData is checked, also pulls endValue data to compare timestamps
            if(config.StaleCheck)
                batchContent['GetEndValue'] = batchSingle(
                    'GET',
                    '$.GetAttributes.Content.Items[*].Content.Items[*].Links.EndValue',
                    ["GetAttributes"]
                )

            return batchContent;
        };

        //piwebapi call for template attributes
        function getAttributes(element) {
            var batchContent = {};

            //finds element
            batchContent['QueryElement'] = batchSingle(
                'GET',
                baseUrl + '/search/query?q=name:'+element+'&fields=name;paths;template;links;'
            )

            //no meta links are specified in Links beside self, so goes through self link
            batchContent['NavigateToSelf'] = batchSingle(
                'GET',
                '$.QueryElement.Content.Items[0].Content.Items[0].Links.Self',
                ["QueryElement"]
            )
            
            //finds that related template in the element's database
            batchContent['GetTemplate'] = batchSingle(
                'GET',
                '{0}/elementtemplates?query={1}&selectedFields=items.links;items.name;',
                ['NavigateToSelf'],
                ['$.NavigateToSelf.Content.Items[0].Content.Links.Database'
                ,'$.NavigateToSelf.Content.Items[0].Content.TemplateName']
            )

            //retrives all the template attributes
            batchContent['GetAttributeList'] = batchSingle(
                'GET',
                '{0}?selectedFields=items.name;items.type;',
                ['GetTemplate'],
                ['$.GetTemplate.Content.Items[0].Content.Items[0].Links.AttributeTemplates']
            )

            return batchContent;
        }

        piWebApiRESTService.sendBatchRequest = function(data) {
            var url = baseUrl + '/batch';
            var cfg = {
                method: 'POST',
                url: url,
                data: data
            }

            return $http(cfg)
                .then(function(response) {
					//console.log(response)
                    var x = response.data;
                    res = x;
                    return x;
                })  
        };
	
        //assume no errors
        function parseJSONData(data) {
            var batchData = [];
            var assetList = [];
            //clears array
            scope.data.length = 0;

            //batch name match with function constructDataBatch names

            data['QueryTemplate']['Content']['Items'][0]['Content']['Items'].forEach(function(item){
                batchData.push({"Name": item.Name, "selected":true});
            });

            //updates template and attribute if it changed
            if(scope.runtimeData.template != data['QueryElement']['Content']['Items'][0]['Content']['Items'][0]['Template']['Name']) {
                scope.runtimeData.template = data['QueryElement']['Content']['Items'][0]['Content']['Items'][0]['Template']['Name'];
                piWebApiRESTService.sendBatchRequest(getAttributes(scope.runtimeData.selectedElement)).then(function(x){
                    parseAttributeData(x);
                })
            }

            //iterates every item and push results to new array
            data['GetValue']['Content']['Items'].forEach(function(item, index){
                if (item.Content.Good) {
                    batchData[index]["Value"] = item.Content.Value;
                    batchData[index]["Time"]= item.Content.Timestamp;
                } else {
                    batchData[index]["Value"] = 0;
                    batchData[index]["Bad"] = true;
                }
                
                if(config.StaleCheck) {
                    batchData[index]["EndTime"] = data['GetEndValue']['Content']['Items'][index]['Content']['Timestamp'];
                }
				//console.log(batchData)
            })
			//console.log(batchData)
            return batchData;
        }

        function parseAttributeData(data) {
            scope.runtimeData.attributeList = [];
            data['GetAttributeList']['Content']['Items'][0]['Content']['Items'].forEach(function(item){
                if(item.Type != 'String')
                    scope.runtimeData.attributeList.push(item);
            })
        }

        // Setup the tool tip
        var formatCount = d3.format(",.0f");
        var formatValue = d3.format(",.2f");
        var formatLabel = function(item, staleCheck, staleRange) {
            var valueString;
            if(item.hasOwnProperty("Bad")) {
                if (item.Bad) {
                    valueString = "Bad/No Data"
                }
                else {
                    valueString = formatValue(item.Value);
                }
            }
            else {
                valueString = formatValue(item.Value);
            }

            if(staleCheck) {
                var currentMilliseconds = new Date(item.Time).getTime();
                var endMilliseconds = new Date(item.EndTime).getTime();
                if(currentMilliseconds > (endMilliseconds + staleRange*60*60*1000))
                    valueString += " - Stale Data"
                    
            }
            return valueString
        }
        var tool_tip = d3.tip()
            .attr("class", "d3-tip")
            .offset([-8, 0])
            .html(function(d) { 
                var names = scope.data.filter(function(data){
                    return d.x0 <= data.Value && data.Value < d.x1;
                })
                var text = "Element(s): "
                for(i = 0; i < names.length; i++) {
                    text += "<br>" + names[i].Name + "(" + formatLabel(names[i], config.StaleCheck, config.StaleRange)  + ")";
                }
                return text;
            });

        //creates d3 histogram
        function initd3(id) {
            var data = scope.data.map(function(x) { if(x.selected) return x.Value; });
            var lineColor = scope.config.ForegroundColor;
            var barColor = scope.config.BackgroundColor;
            var hoverColor = scope.config.HighlightColor;
            var binNumber = scope.config.BinNumber;

            //Clean Graph before each creation;
            var hist = d3.select("#"+id);
            hist.selectAll("*").remove();

            //calls tool tip
            hist.call(tool_tip);

            //define graph size
            var svg = hist,
                margin = {top: 20, right: 30, bottom: 60, left: 30},
                width = +svg.attr("width") - margin.left - margin.right,
                height = +svg.attr("height") - margin.top - margin.bottom,
                g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")"),
                bisectDate = d3.bisector(function(d) { return d.date; }).left;

            //create title
            var titleText = scope.runtimeData.template + " Template | "
            titleText += scope.runtimeData.selectedAttribute;
            if(selectedUnits) {
                titleText += " (Units : "+selectedUnits+")"
            }
            svg.append("text")
                .attr("class", "histTitle")
                .attr("x", width/2)
                .attr("y", margin.top + height + (margin.bottom * 0.75))
                .attr("text-anchor", "middle")
                .attr("fill", lineColor)
                .text(titleText)
                
            //ASSUMPTION: No negative numbers
            //Define x axis range
            var max = d3.max(data)
            if(max==0)
                max=1
            var x = d3.scaleLinear()
                .domain([0,max*1.05])
                .rangeRound([0, width]);

            //Sorts data into bins
            var bins = d3.histogram()
                .domain(x.domain())
                .thresholds(x.ticks(binNumber))
                ( data );

            //Define y axis
            var y = d3.scaleLinear()
                .domain([0, d3.max(bins, function(d) { return d.length; })])
                .range([height, 0]);

            //Creation of histrogram bars
            var bar = g.selectAll(".bar")
                .data(bins)
                .enter().append("g")
                .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
            bar.append("rect")
                .attr("x", 1)
                .attr("width", x(bins[0].x1) - x(bins[0].x0) - 1)
                .attr("height", function(d) { return height - y(d.length); })
                .attr("fill", barColor)
                .on('mouseover', function(x) {
                    tool_tip.show(x);
                    d3.select(this).attr("fill", hoverColor);
                })
                .on('mouseout', function(x) {
                    tool_tip.hide(x);
                    d3.select(this).attr("fill", barColor);
                })
            bar.append("text")
                .attr("dy", ".75em")
                .attr("y", 6)
                .attr("x", (x(bins[0].x1) - x(bins[0].x0)) / 2)
                .attr("text-anchor", "middle")
                .text(function(d) { if(d.length!=0) return formatCount(d.length); })
                .attr("class", "histText")
                .attr("fill", lineColor);

            //creates x axis
            var xAxis = g.append("g")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x))
            xAxis.selectAll("path")
                .attr("stroke", lineColor)
            xAxis.selectAll(".tick text")
                .attr("fill", lineColor)
            xAxis.selectAll(".tick line")
                .attr("stroke", lineColor)
                
        }

        function resize(width, height) {
            scope.width = width;
            scope.height = height;
            if(scope.data.length != 0)
                initd3(element.find('svg')[0].id);
        }

        //when new attribute is selected
        scope.runtimeData.updateData = function() {
            var currentAttribute = scope.symbol.DataSources[0];
            var currentPath = currentAttribute.split('|')[0];
            scope.symbol.DataSources[0] = currentPath + '|' + scope.runtimeData.selectedAttribute;
            
            piWebApiRESTService.sendBatchRequest(constructDataBatch(scope.runtimeData.selectedElement, scope.runtimeData.selectedAttribute, endTime)).then(function(x){
                scope.data = parseJSONData(x);
                scope.runtimeData.assetList = scope.data;
                initd3(id);
            });
        }

        //when element selection is changed
        scope.runtimeData.updateGraph = function() {
            angular.merge(scope.data, scope.runtimeData.assetList);
            initd3(id);
        }

        //when histogram properties change
        scope.runtimeData.updateColor = function() {
            initd3(id);
        }        
    };

    PV.symbolCatalog.register(definition);

})(window.PIVisualization);