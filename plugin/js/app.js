var data = data1;

var width = 1024,
    height = 700,
    host = ['127.0.0.1', '5004', '', ''],
    cellColor = d3.scale.category20b(),
    pieColor = d3.scale.category10();

var treemap = d3.layout.treemap()
    .size([width, height])
    .sticky(false)
    .children( function(d) { return d.children } )
    .value(function(d) { return d.size; });


var div = d3.select("#drawboard").append("div")
//    .style("position", "relative")
    .style("width", width)
    .style("height", height);

var cells = div.data([data]).selectAll("div")
    .data(treemap);

cells.enter().append("div")
    .attr("class", function(d){ return "cell";})
    .style("background-color", function(d, i) { return d.children ? null : cellColor(i); })
    .attr("id", function(d) { return d.data.name; })
    .attr("class", function(d){ return d.children ? "root cell" : "child cell";})
    .call(updateCell);

cells.exit().remove();

var arc = d3.svg.arc()
    .innerRadius(function (d) { return (Math.min(d.data.parent.dy, d.data.parent.dx)/2) - 20; })
    .outerRadius(function (d) { var innerRadius = 
                                ((Math.min(d.data.parent.dy, d.data.parent.dx)/2) - 20); 
                                return innerRadius - (innerRadius/2.5); });

var pie = d3.layout.pie().sort(null)
    .value(function(d) { return d.chunks.length; });

var svg = d3.selectAll(".child.cell")
  .append("svg:svg")
    .attr("width", function(d) { return d.dx; })
    .attr("height", function(d) { return d.dy; })
  .append("svg:g");

var arcs = svg.selectAll("path")
    .data(function (d) {
            for (var i in d.data.shards) {
             d.data.shards[i].parent = d;
           }
           return pie(d.data.shards);
         });

var arcEntering = arcs.enter();

arcEntering.append("svg:path")
    .call(updatePie);

setInterval(function () {
  getCollections(host, function (collections) {
    getShards(host, function (shards) {
      getChunks(host, function (chunks) {
        data = formatData(collections.rows, shards.rows, chunks.rows); 
	console.log(data);
  
        cells = div.data([data]).selectAll("div")
            .data(treemap);
  
        cells.enter().append("div")
            .style("width", "0")
            .style("height", "0");
        
        cells
            .attr("id", function(d) { return d.data.name; })
            .attr("class", function(d){ return d.children ? "root cell" : "child cell";});
  
        d3.selectAll("svg").remove();
  
        svg = d3.selectAll(".child.cell").append("svg:svg")
            .attr("width", function(d) { return d.dx; })
            .attr("height", function(d) { return d.dy; })
          .append("svg:g");
  
        arcs = svg.selectAll("path")
           .data(function (d) {
                   for (var i in d.data.shards) {
                    d.data.shards[i].parent = d;
                  }
                  return pie(d.data.shards);
                });
  
        arcEntering = arcs.enter();
  
        arcEntering.append("svg:path")
          .call(updatePie);
  
        cells.transition()
            .duration(500)
            .call(updateCell);
  
        cells.exit().remove();
        arcs.exit().remove();
      });
    });
  });
}, 500);


function updatePie() {
  this
      .attr("transform", function (d) { return "translate(" + d.data.parent.dx / 2 + ", " + d.data.parent.dy / 2 +")"; })
      .attr("fill", function(d) { return pieColor(d.data._id); })
      .attr("class", function(d) { return d.data._id; })
      .attr("d", function (d) { return arc(d); });
}


function updateCell() {
  this
      .style("background-color", function(d, i) { return d.children ? null : cellColor(i); })
      .style("left", function(d) { return d.x + "px"; })
      .style("top", function(d) { return d.y + "px"; })
      .style("width", function(d) { return Math.max(0, d.dx - 1) + "px"; })
      .style("height", function(d) { return Math.max(0, d.dy - 1) + "px"; });
}

// vim: set et sw=2 ts=2;
