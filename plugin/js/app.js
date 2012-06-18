$(document).ready(function() {
  var width = 1024,
      height = 700,
      cellColor = d3.scale.category20(),
      pieColor = d3.scale.category20c(),
      host = ['127.0.0.1', '5004', '', ''];

  var svg = d3.selectAll("#drawboard").append("svg")
      .attr("width", width)
      .attr("height", height);

  var treemap = d3.layout.treemap()
      .size([width, height])
      .sticky(true) // may need to change this
      .value(function(d) { return d.size; });

  var arc = d3.svg.arc()
      .innerRadius(function (d) { return (Math.min(d.data.parent.dy, d.data.parent.dx)/2) - 20; })
      .outerRadius(function (d) { var innerRadius = ((Math.min(d.data.parent.dy, d.data.parent.dx)/2) - 20); return innerRadius - (innerRadius/2.5); });

  var pie = d3.layout.pie()
      .value(function(d) { return d.chunks.length; });

  var cells, data, arcs;

  d3.json("./data1.json", function (data1) {
    data = data1;

    cells = svg.data([data]).selectAll("rect")
        .data(treemap);

    cells
        .enter().append("g")
        .attr("class", "cell")
      .append("rect")
        .attr("class", "block")
        .attr("width", function(d) { return d.dx; })
        .attr("height", function(d) { return d.dy; })
        .attr("id", function(d) { return d.data.name; })
        .style("fill", function(d, i) { return cellColor(i) })
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

    arcs = cells.filter(function(d) { return (d.children) ? false : true; }).selectAll("g.slice")
        .data(function (d) {
          for (var i in d.data.shards) {
            d.data.shards[i].parent = d;
          }
          return pie(d.data.shards);
        });
  
    arcs.enter().append("g")
        .attr("class", "slice")
        .attr("transform", function (d) { return "translate(" + d.data.parent.dx / 2 + ", " + d.data.parent.dy / 2 +")"; })
      .append("path")
        .attr("fill", function(d) { return pieColor(d.data._id); })
        .attr("class", function(d) { return d.data._id; })
        .attr("d", function (d) { return arc(d); });
    
    cells.exit().remove();
    arcs.exit().remove();
  });

  d3.select("body").on("click", function() {
    cells = svg.data([data]).selectAll("rect")
        .data(treemap);
    
    cells
        .attr("width", function(d) { return d.dx; })
        .attr("height", function(d) { return d.dy; })
        .attr("id", function(d) { return d.data.name; })
        .style("fill", function(d, i) { return cellColor(i) })
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

    arcs = cells.filter(function(d) { return (d.children) ? false : true; }).selectAll("path")
        .data(function (d) {
          for (var i in d.data.shards) {
            d.data.shards[i].parent = d;
          }
          return pie(d.data.shards);
        });

    arcs
        .attr("fill", function(d) { return pieColor(d.data._id); })
        .attr("class", function(d) { return d.data._id; })
        .attr("d", function (d) { return arc(d); });
  });

  setTimeout(function() { d3.json("./data2.json", function (data2) {
    data = data2;
    draw(data); });
    }, 2000);
  
  d3.select("#draw").on("click", function () {
    draw(data);
  });
});
// vim: set et sw=2 ts=2 sts=2;
