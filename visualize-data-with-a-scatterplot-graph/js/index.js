var margin = {
  top: 20,
  right: 20,
  bottom: 30,
  left: 40 };


var width = 900 - margin.left - margin.right;
var height = 600 - margin.top - margin.bottom;

var y = d3.scaleLinear().range([height, 0]);
var x = d3.scaleLinear().range([0, width - 200]);


var container = d3.select('#scatterplot-body');
var svg = container.append('svg').
attr('width', width).
attr('height', height + margin.top + margin.bottom).
append('g').
attr('transform', 'translate(' + (margin.left + 50) + ', ' + margin.top + ')');


//start working with the data
fetch('dopping.json').
then(function (response) {return response.json();}).
then(function (data) {

  var timeMinSec = function timeMinSec(seconds) {
    var date = new Date(null);
    date.setSeconds(seconds);
    return date;
  };

  var time = data.map(function (d) {return d.Seconds;});
  var minTime = d3.min(time);
  var maxTime = d3.max(time);

  var year = data.map(function (d) {return d.Year;});
  var minYear = d3.min(year);
  var maxYear = d3.max(year);

  //create the axes
  x.domain([minYear - 3, maxYear + 3]);
  y.domain([minTime - 10, maxTime + 10]);

  var xAxis = d3.axisBottom(x);
  var yAxis = d3.axisLeft(y);

  svg.append('g').
  attr('transform', 'translate(0, ' + height + ')').
  call(xAxis);

  svg.append('g').
  call(yAxis);

  svg.append('text').
  text('Time in Seconds').
  style('font-size', '18px').
  attr('transform', 'rotate(-90)').
  attr('x', 0 - height / 2).
  attr('y', 0 - margin.left);

  var tip = d3.select('#scatterplot-body').
  append('div').
  attr('class', 'tooltip');

  //create all the circles in the plot
  svg.selectAll('circle').
  data(data).
  enter().
  append('circle').
  attr('cx', function (d) {return x(d.Year);}).
  attr('cy', function (d) {return y(d.Seconds);}).
  attr('r', 7).
  attr('class', function (d) {return d.Doping ? 'red' : 'blue';}).
  on('mousemove', function (d) {
    tip.
	style('position', 'absolute').                         
    style('left', d3.event.pageY + 10 + 'px').
    style('top', d3.event.pageX + 20 + 'px').
    style('display', 'inline-block').
    style('opacity', '0.9').
    html('\n            <span>' +
    d.Name + ': ' + d.Nationality + '</span>\n            <span>Year: ' +
    d.Year + ', Time: ' + d.Time + '</span>\n            <br>\n            <span>' +

    d.Doping + '</span>\n          ');

  }).
  on('mouseout', function () {return tip.style('display', 'none');});


  //explanatory circles
  svg.append('circle').
  attr('class', 'red').
  attr('cx', '550').
  attr('cy', '270').
  attr('r', '6');

  svg.append('text').
  attr('x', '560').
  attr('y', '273').
  text('Riders with doping allegations');

  svg.append('circle').
  attr('class', 'blue').
  attr('cx', '550').
  attr('cy', '300').
  attr('r', '7');

  svg.append('text').
  attr('x', '560').
  attr('y', '303').
  text('No doping allegations');


});