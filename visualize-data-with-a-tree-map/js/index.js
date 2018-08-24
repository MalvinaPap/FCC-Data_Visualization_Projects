var URL = "https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/movie-data.json";

var tooltip = d3.select("#tooltip");
var svg = d3.select("#tree-map");

var fader = function fader(color) {return d3.interpolateRgb(color, "#6666ff")(0.2);};
var color = d3.scaleOrdinal(d3.schemeCategory20.map(fader));

var treemap = d3.treemap().
size([svg.attr("width"), svg.attr("height")]).
paddingInner(2);

d3.json(URL, function (error, data) {

  if (error) throw error;

  var root = d3.hierarchy(data).
  eachBefore(function (d) {
    d.data.id = (d.parent ? d.parent.data.id + "." : "") + d.data.name;
  }).
  sum(function (d) {return d.value;}).
  sort(function (a, b) {return b.height - a.height || b.value - a.value;});

  treemap(root);

  var cell = svg.selectAll("g").
  data(root.leaves()).
  enter().append("g").
  attr("class", "group").
  attr("transform", function (d) {return "translate(" + d.x0 + "," + d.y0 + ")";});

  var tile = cell.append("rect").
  attr("id", function (d) {return d.data.id;}).
  attr("class", "tile").
  attr("width", function (d) {return d.x1 - d.x0;}).
  attr("height", function (d) {return d.y1 - d.y0;}).
  attr("data-name", function (d) {
    return d.data.name;
  }).
  attr("data-category", function (d) {
    return d.data.category;
  }).
  attr("data-value", function (d) {
    return d.data.value;
  }).
  attr("fill", function (d) {
    return color(d.data.category);
  }).
  on("mousemove", function (d) {
    tooltip.style("opacity", .9);
    tooltip.html(
    'Name: ' + d.data.name +
    '<br>Category: ' + d.data.category +
    '<br>Value: $' + d.data.value).

    attr("data-value", d.data.value).
    style("left", d3.event.pageX + 10 + "px").
    style("top", d3.event.pageY - 28 + "px");
  }).
  on("mouseout", function (d) {
    tooltip.style("opacity", 0);
  });

  cell.append("text").
  attr('class', 'tile-text').
  selectAll("tspan").
  data(function (d) {return d.data.name.split(/(?=[A-Z][^A-Z])/g);}).
  enter().append("tspan").
  attr("x", 15).
  attr("y", function (d, i) {return 15 + i * 10;}).
  text(function (d) {return d;});




  var categories = root.leaves().map(function (nodes) {
    return nodes.data.category;
  });
  categories = categories.filter(function (category, index, self) {
    return self.indexOf(category) === index;
  });
  var legend = d3.select("#legend");
  var LEGEND_OFFSET = 10;
  var LEGEND_RECT_SIZE = 15;
  var LEGEND_H_SPACING = 150;
  var LEGEND_V_SPACING = 10;
  var LEGEND_TEXT_X_OFFSET = 3;
  var LEGEND_TEXT_Y_OFFSET = -2;
  var legendElemsPerRow = Math.floor(legend.attr("width") / LEGEND_H_SPACING);

  var legendElem = legend.
  append("g").
  attr("transform", "translate(60," + LEGEND_OFFSET + ")").
  selectAll("g").
  data(categories).
  enter().append("g").
  attr("transform", function (d, i) {
    return 'translate(' +
    i % legendElemsPerRow * LEGEND_H_SPACING + ',' + (
    Math.floor(i / legendElemsPerRow) * LEGEND_RECT_SIZE + LEGEND_V_SPACING * Math.floor(i / legendElemsPerRow)) + ')';
  });

  legendElem.append("rect").
  attr('width', LEGEND_RECT_SIZE).
  attr('height', LEGEND_RECT_SIZE).
  attr('class', 'legend-item').
  attr('fill', function (d) {
    return color(d);
  });

  legendElem.append("text").
  attr('x', LEGEND_RECT_SIZE + LEGEND_TEXT_X_OFFSET).
  attr('y', LEGEND_RECT_SIZE + LEGEND_TEXT_Y_OFFSET).
  text(function (d) {return d;});
});