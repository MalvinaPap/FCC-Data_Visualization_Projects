//read the .json file and return an array of objects containing dates and gdps
var url = "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/GDP-data.json";
$.getJSON(url, function(data) {
  var chartData = data.data;
  var source = data.description;
  var chartObj = chartData.map(function(record) {
    var obj = {};
    obj.date = record[0];
    obj.gdp = record[1];
    return obj;
  });
   
  //get the first and last date in the file, which will indicate where the x axis starts
  //and ends
  var startDate = new Date(chartObj[0].date);
  var endDate = new Date(chartObj[chartObj.length - 1].date);

  //get the maximum domestic product in the file which indicates the height of the y axis,
  var max = d3.max(chartObj, function(d) {
      return d.gdp
    });
	
	
//margins inside the barchart box	
  var  margin = {
      top: 20,
      right: 20,
      bottom: 30,
      left: 50
     }; 	
//height of	the barchart box	
var scaleMax = Math.floor(max/30);
var height = scaleMax + margin.bottom + margin.top;
//width of the barchart box	 
var width = (chartObj.length * 3) + margin.left + margin.right;
//with of each bar in the chart
var barWidth = (width - margin.left) / chartObj.length;


//create x and y axes for the barchart
var x = d3.time.scale()
   .domain([startDate, endDate])
   .range([0, width - margin.left]);
var y = d3.scale.linear()
   .domain([0,max])
   .range([scaleMax, 0]);

var xAxis = d3.svg.axis()
   .scale(x)
   .orient('bottom')
   .ticks(d3.time.years, 5);
var yAxis = d3.svg.axis()
   .scale(y)
   .orient("left")
   .ticks(10,"$");

   
 //select svg element with id=#barchart, to create the barchart inside it  
 var chart = d3.select('#barchart')
    .attr('width', width + margin.right + margin.left)
    .attr('height', height + margin.bottom + margin.top)
    .append('g')
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	
//create the barchart	
 var bar = chart.selectAll('g')
    .data(chartObj)
    .enter()
    .append('g') 
    .attr('transform', function(d) {
      var adjustment = d.gdp / 30;
      var difference = scaleMax - adjustment;
      return "translate(" + (chartObj.indexOf(d) * barWidth) + ", " + difference + ")";
    })
    .append('rect')
    .attr('class', 'bar')
    .attr("width", barWidth)
    .attr("height", function(d) {
      return d.gdp / 30;
    })
    .on('mouseover', function(d) {
      var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      var month = months[+d.date.slice(5, 7)];
      var xPos = d3.transform(d3.select(this.parentNode).attr("transform")).translate[0];
      var yPos = event.pageY - 940;
      var tooltip = d3.select('#tooltip')
        .style('left', xPos + 'px')
        .style('top', yPos + 'px')
        .attr('class', 'tips');

      d3.select('#currency').text("$" + d.gdp + " Billion");
      d3.select('#date').text(d.date.slice(0, 4) + ' - ' + month);
    })
    .on('mouseout', function() {
      d3.select('#tooltip').attr('class', 'hidden');
    });


//appeend x and y axes to the chart
chart.append("g")
   .attr("class", "x axis")
   .attr("id", "x-axis")
   .attr("transform", "translate(0," + scaleMax + ")")
   .call(xAxis);

chart.append("g")
   .attr("class", "y axis")
   .attr("id", "y-axis")
   .call(yAxis)

});