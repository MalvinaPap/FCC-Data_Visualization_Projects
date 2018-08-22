var url = "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json";

var colors = ["#a50026", "#d73027", "#f46d43", "#fdae61", "#fee090", "#ffffbf", "#e0f3f8", "#abd9e9", "#74add1", "#4575b4", "#313695"];

d3.json(url, callback);

function callback(data) {

  var fontSize = 18;
  var width = 6 * Math.ceil(data.monthlyVariance.length / 12); //1500;
  var height = 33 * 12; //400;
  var padding = { left: 9 * fontSize, right: 9 * fontSize, top: 1 * fontSize, bottom: 8 * fontSize };

  //tooltip
  var tip = d3.tip().
  attr("class", "d3-tip").
  attr("id", "tooltip").
  html(function (d) {
    return d;
  }).
  direction("n").
  offset([-10, 0]);

  var svg = d3.select("section").
  append("svg").
  attr({
    width: width + padding.left + padding.right,
    height: height + padding.top + padding.bottom }).

  call(tip);


  //yaxis
  data.monthlyVariance.forEach(function (val) {
    val.month -= 1;
  });
  var yScale = d3.scale.ordinal().
  domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]) //months
  .rangeRoundBands([0, height], 0, 0);
  var yAxis = d3.svg.axis().
  scale(yScale).
  tickValues(yScale.domain()).
  tickFormat(function (month) {
    var date = new Date(0);
    date.setUTCMonth(month);
    return d3.time.format.utc("%B")(date);
  }).
  orient("left").
  tickSize(10, 2);

  svg.append("g").
  classed("y-axis", true).
  attr("id", "y-axis").
  attr("transform", "translate(" + padding.left + "," + padding.top + ")").
  call(yAxis).
  append("text").
  text("Months").
  attr("transform", "translate(" + -7 * fontSize + "," + height / 2 + ")" + "rotate(-90)");

  //xaxis
  var xScale = d3.scale.ordinal().
  domain(data.monthlyVariance.map(function (val) {return val.year;})).
  rangeRoundBands([0, width], 0, 0);
  var xAxis = d3.svg.axis().
  scale(xScale).
  tickValues(xScale.domain().filter(function (year) {
    return year % 10 === 0;
  })).
  tickFormat(function (year) {
    var date = new Date(0);
    date.setUTCFullYear(year);
    return d3.time.format.utc("%Y")(date);
  }).
  orient("bottom").
  tickSize(10, 2);

  svg.append("g").
  classed("x-axis", true).
  attr("id", "x-axis").
  attr("transform", "translate(" + padding.left + "," + (height + padding.top) + ")").
  call(xAxis).
  append("text").
  text("Years").
  attr("transform", "translate(" + width / 2 + "," + 3 * fontSize + ")");

  //legend
  var legendColors = colors.reverse();
  var legendWidth = 550;
  var legendHeight = 300 / legendColors.length;

  var variance = data.monthlyVariance.map(function (val) {
    return val.variance;
  });
  var minTemp = data.baseTemperature + Math.min.apply(null, variance);
  var maxTemp = data.baseTemperature + Math.max.apply(null, variance);

  var legendThreshold = d3.scale.threshold().
  domain(function (min, max, count) {
    var array = [];
    var step = (max - min) / count;
    var base = min;
    for (var i = 1; i < count; i++) {
      array.push(base + i * step);
    }
    return array;
  }(minTemp, maxTemp, legendColors.length)).
  range(legendColors);

  var legendX = d3.scale.linear().
  domain([minTemp, maxTemp]).
  range([0, legendWidth]);

  var legendXAxis = d3.svg.axis().
  scale(legendX).
  orient("bottom").
  tickSize(10, 0).
  tickValues(legendThreshold.domain()).
  tickFormat(d3.format(".1f"));

  var legend = svg.append("g").
  classed("legend", true).
  attr("id", "legend").
  attr("transform", "translate(" + padding.left + "," + (padding.top + height + padding.bottom - 2 * legendHeight) + ")");

  legend.append("g").
  selectAll("rect").
  data(legendThreshold.range().map(function (color) {
    var d = legendThreshold.invertExtent(color);
    if (d[0] == null) d[0] = legendX.domain()[0];
    if (d[1] == null) d[1] = legendX.domain()[1];
    return d;
  })).
  enter().append("rect").
  style("fill", function (d, i) {return legendThreshold(d[0]);}).
  attr({
    x: function x(d, i) {return legendX(d[0]);},
    y: 0,
    width: function width(d, i) {return legendX(d[1]) - legendX(d[0]);},
    height: legendHeight });


  legend.append("g").
  attr("transform", "translate(" + 0 + "," + legendHeight + ")").
  call(legendXAxis);

  //map
  svg.append("g").
  classed("map", true).
  attr("transform", "translate(" + padding.left + "," + padding.top + ")").
  selectAll("rect").
  data(data.monthlyVariance).
  enter().append("rect").
  attr('class', 'cell').
  attr('data-month', function (d) {
    return d.month;
  }).
  attr('data-year', function (d) {
    return d.year;
  }).
  attr('data-temp', function (d) {
    return data.baseTemperature + d.variance;
  }).
  attr({
    x: function x(d, i) {
      return xScale(d.year);
    },
    y: function y(d, i) {
      return yScale(d.month);
    },
    width: function width(d, i) {
      return xScale.rangeBand(d.year);
    },
    height: function height(d, i) {
      return yScale.rangeBand(d.month);
    } }).

  attr("fill", function (d, i) {
    return legendThreshold(data.baseTemperature + d.variance);
  }).
  on("mouseover", function (d) {
    var date = new Date(d.year, d.month);
    var str = "<span class='date'>" + d3.time.format("%Y - %B")(date) + "</span>" + "<br />" +
    "<span class='temperature'>" + d3.format(".1f")(data.baseTemperature + d.variance) + "&#8451;" + "</span>" + "<br />" +
    "<span class='variance'>" + d3.format("+.1f")(d.variance) + "&#8451;" + "</span>";
    tip.attr("data-year", d.year);
    tip.show(str);
  }).
  on("mouseout", tip.hide);
}