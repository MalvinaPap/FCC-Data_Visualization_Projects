var svg = d3.select("svg");
var tooltip = d3.select("#tooltip");

var width = +svg.attr("width");
var height = +svg.attr("height");

var path = d3.geoPath();

var x = d3.scaleLinear()
    .domain([2.6, 75.1])
    .rangeRound([600, 860]);

var color = d3.scaleThreshold()
    .domain(d3.range(2.6, 75.1, (75.1-2.6)/8))
    .range(d3.schemeOranges[9]);

var g = svg.append("g")
    .attr("id", "legend")
    .attr("transform", "translate(0,40)");

g.selectAll("rect")
  .data(color.range().map(function(d) {
      d = color.invertExtent(d);
      if (d[0] == null) d[0] = x.domain()[0];
      if (d[1] == null) d[1] = x.domain()[1];
      return d;
    }))
  .enter().append("rect")
    .attr("height", 12)
    .attr("x", function(d) { return x(d[0]); })
    .attr("width", function(d) { return x(d[1]) - x(d[0]); })
    .attr("fill", function(d) { return color(d[0]); });

g.call(d3.axisBottom(x)
    .tickSize(16)
    .tickFormat(function(x) { return Math.round(x) + '%' })
    .tickValues(color.domain()))
    .select(".domain")
    .remove();

const EDUCATION= 'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json';
const COUNTY= 'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json';

d3.queue()
    .defer(d3.json, COUNTY)
    .defer(d3.json, EDUCATION)
    .await(ready);

function ready(error, us, education) {
  if (error) throw error;

  svg.append("g")
      .attr("class", "counties")
      .selectAll("path")
      .data(topojson.feature(us, us.objects.counties).features)
      .enter().append("path")
      .attr("class", "county")
      .attr("data-fips", function(d) {
        return d.id
       })
      .attr("data-education", function(d) {
        var result = education.filter(function( obj ) {
          return obj.fips == d.id;
        });
        if(result[0]){
          return result[0].bachelorsOrHigher
        }
       })
      .attr("fill", function(d) { 
        var result = education.filter(function( obj ) {
          return obj.fips == d.id;
        });
        if(result[0]){
          return color(result[0].bachelorsOrHigher)
        }
       })
      .attr("d", path)
      .on("mouseover", function(d) {      
        tooltip.style("opacity", 10); 
        tooltip.html(function() {
          var result = education.filter(function( obj ) {
            return obj.fips == d.id;
          });
          if(result[0]){
            return result[0]['area_name'] + ', ' + result[0]['state'] + ': ' + result[0].bachelorsOrHigher + '%'
          }
        })
      .attr("data-education", function() {
        var result = education.filter(function( obj ) {
          return obj.fips == d.id;
        });
        if(result[0]){
          return result[0].bachelorsOrHigher
        }
       })
          .style("left", (d3.event.pageX + 10) + "px") 
          .style("top", (d3.event.pageY -30) + "px"); }) 
          .on("mouseout", function(d) { 
            tooltip.style("opacity", 0); 
          });

  svg.append("path")
      .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
      .attr("class", "states")
      .attr("d", path);
}