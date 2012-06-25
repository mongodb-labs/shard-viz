var data = data1; var pieData;

var width = 1024,
    height = 700,
    host = ['127.0.0.1', '5004', '', ''],
    cellColor = d3.scale.category20b(),
    pieColor = d3.scale.category10();

var treemap = d3.layout.treemap()
    .size([width, height])
    .sticky(true)
    .children( function(d) { return d.children } )
    .value(function(d) { return d.size; });


var div = d3.select("#drawboard").append("svg:svg")
    .style("width", width)
    .style("height", height)
    .attr("id", "treemap");

var cells = div.data([data]).selectAll("rect")
    .data(treemap);

cells.enter().append("rect")
    .attr("class", function(d){ return "cell";})
    // .attr("render-order" , "-10")
    .style("fill", function(d, i) { return d.children ? null : cellColor(i); })
    .attr("id", function(d) { return d.data.name; })
    .attr("class", function(d){ return d.children ? "root cell" : "child cell";})
    .call(updateCell);

var arc = d3.svg.arc()
    .innerRadius(function (d) { return Math.ceil((Math.min(d.data.dy, d.data.dx)/2) - 20); })
    .outerRadius(function (d) { var innerRadius = 
                                ((Math.min(d.data.dy, d.data.dx)/2) - 20); 
                                return Math.ceil(innerRadius - (innerRadius/2.5)); });

var pie = d3.layout.pie().sort(null)
    .value(function(d) { return d.chunks.length; });

//var svg = d3.select("#drawboard").selectAll("svg");

pieData = formatShards(cells.data());
var arcs = d3.select("#drawboard").select("#treemap").selectAll("g")
    .data(pieData);

arcs.enter()
  .append("svg:g")
    // .attr("render-order", "10")
    .attr("width", function(d) { return d.dx; })
    .attr("height", function(d) { return d.dy; })
    .attr("transform", function (d) { return "translate(" + d.x + ", " + d.y + ")"; })

var slices = arcs.selectAll("path")
  .data(function (d) { return pie(d.data.shards) });

// console.log(arcs);
// console.log(slices);

slices
  .enter().append("svg:path")
      // .attr("render-order", "10")
    .call(updatePie);

//console.log(slices);
slices.exit().remove();
arcs.exit().remove();
cells.exit().remove();

setInterval(function () {
  getCollections(host, function (collections) {
    getShards(host, function (shards) {
      getChunks(host, function (chunks) {

        data = formatData(collections.rows, shards.rows, chunks.rows); 
        
        treemap = d3.layout.treemap()
          .size([width, height])
          .sticky(true)
          .children( function(d) { return d.children } )
          .value(function(d) { return d.size; });

        cells = div.data([data]).selectAll("rect")
            .data(treemap);

        cells.enter().append("rect")
            .style("width", "0")
            .style("height", "0");

        cells
            // .attr("render-order", "-10")
            .attr("id", function(d) { return d.data.name; })
            .attr("class", function(d){ return d.children ? "root cell" : "child cell";})
        
        cells.transition()
          .duration(500)
          .call(updateCell);

        pieData = formatShards(cells.data());

        arcs = d3.select("#drawboard").select("#treemap").selectAll("g")
            .data(pieData);

        // Handle enters for pie containers
        arcs.enter()
          .append("svg:g")
              // .attr("render-order", "10");

        // Handle updates for pie containers
        arcs.transition()
          .duration(500)
            .attr("width", function (d) { return d.dx })
            .attr("height", function(d) { return d.dy; })
            .attr("transform", function (d) { return "translate(" + d.x + ", " + d.y + ")"; });

        slices = arcs.selectAll("path")
          .data(function (d) { return pie(d.data.shards); })  

        // Handle enters of pie arcs
        slices.enter().append("svg:path")
            // .attr("render-order", "10")
            .each(function(d){ this._current = d; })
        
        // Handle updates of pie arcs
        slices.transition().duration(200)
          .call(updatePie);

        cells.exit().remove();
        slices.exit().remove();
        arcs.exit().remove();
      });
    });
  });
}, 750);

function arcTween(a) {
  var i = d3.interpolate(this._current, a);
  this._current = i(0);
  return function(t) {
    return arc(i(t));
  };
}

function updatePie() {
  this
      .attr("transform", function (d) { return "translate(" + d.data.dx / 2 + ", " + d.data.dy / 2 +")"; })
      .attr("fill", function(d) { return pieColor(d.data._id); })
      .attr("class", function(d) { return d.data._id; })
      .attr("d", function (d) { return arc(d); });
}

function updateCell() {
  this
      .style("fill", function(d, i) { return d.children ? null : cellColor(i); })
      .attr("x", function(d) { return d.x + "px"; })
      .attr("y", function(d) { return d.y + "px"; })
      .attr("width", function(d) { return Math.max(0, d.dx - 1) + "px"; })
      .attr("height", function(d) { return Math.max(0, d.dy - 1) + "px"; });
}

// vim: set et sw=2 ts=2;
