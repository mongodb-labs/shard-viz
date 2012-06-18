
var data = data1;

var width = 1024,
    height = 700,
    cellColor = d3.scale.category20();

var treemap = d3.layout.treemap()
    .size([width, height])
    .sticky(false)
    .children( function(d) { return d.children } )
    .value(function(d) { return d.size; });

var div = d3.select("#drawboard").append("div")
    .style("position", "relative")
    .style("width", width)
    .style("height", height);

var cells = div.data([data]).selectAll("div")
    .data(treemap);

cells.enter().append("div")
    .attr("class", function(d){ return "cell";})
    .style("background-color", function(d, i) { return d.children ? null : cellColor(i); })
    .attr("id", function(d) { return d.name; })
    .call(cell);

cells.exit().remove();

d3.select("#draw").on("click", function() {

  data = data === data1 ? data3 : data1;

  cells = div.data([data]).selectAll("div")
      .data(function(d){ return treemap(d); });

  cells.enter().append("div")
      .style("width", "0")
      .style("height", "0");

  cells
    .transition()
      .duration(500)
      .call(cell);

  cells.exit().remove();
    
});



function cell() {
  this
      .attr("id", function(d) { return d.data.name; })
      .attr("class", function(d){ return "cell";})
      .style("background-color", function(d, i) { return d.children ? null : cellColor(i); })
      .style("left", function(d) { return d.x + "px"; })
      .style("top", function(d) { return d.y + "px"; })
      .style("width", function(d) { return Math.max(0, d.dx - 1) + "px"; })
      .style("height", function(d) { return Math.max(0, d.dy - 1) + "px"; });
}

// vim: set et sw=2 ts=2;
