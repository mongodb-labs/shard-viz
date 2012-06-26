function collections() {
  var width = 1024,
      height = 700,
      delay = 500, // transition delay in milliseconds
      cellColor = d3.scale.category20b(),
      pieColor = d3.scale.category10();
  
  var treemap = d3.layout.treemap()
    .size([width, height])
    .sticky(true)
    .children(function(d) { return d.children; })
    .value(function(d) { return d.size; });

  var arc = d3.svg.arc()
    .innerRadius(function(d) { return Math.ceil((Math.min(d.data.dy, d.data.dx)/2) - 20); })
    .outerRadius(function(d) { var innerRadius = 
                               ((Math.min(d.data.dy, d.data.dx)/2) - 20);
                               return Math.ceil(innerRadius - (innerRadius/2.5)); });
  
  var pie = d3.layout.pie().sort(null)
    .value(function(d) { return d.chunks.length; });
  
  /* Given the output of treemap(formatData()), return a list of shards to be used 
   * for graphing pie charts 
   */
  function formatShards(data) {
    var shards = []; 
    var pos = 0;
    for (var i in data) {
      if (!data[i].children) {
        var shard = {}; 
        shard.data = data[i].data;
        shard.x = data[i].x;
        shard.y = data[i].y;
        shard.dx = data[i].dx;
        shard.dy = data[i].dy;
        
        // add dx and dy to each shard
        for (var j in shard.data.shards) {
          shard.data.shards[j].dx = data[i].dx;
          shard.data.shards[j].dy = data[i].dy;
        }   
        shards[pos++] = shard;
      }   
    }
    return shards; 
  }

  function arcTween(a) {
    var i = d3.interpolate(this._current, a); 
    this._current = i(0);
    return function(t) {
      return arc(i(t));
    };  
  }

  function updateCells() {
    this
      .style("fill", function(d, i) { return d.children ? null : cellColor(i); })
      .attr("x", function(d) { return d.x + "px"; })
      .attr("y", function(d) { return d.y + "px"; })
      .attr("width", function(d) { return Math.max(0, d.dx - 1) + "px"; })
      .attr("height", function(d) { return Math.max(0, d.dy - 1) + "px"; });
  }

  function updatePies() {
    this
      .attr("width", function(d) { return d.dx; })
      .attr("height", function(d) { return d.dy; })
      .attr("transform", function (d) { return "translate(" + d.x + ", " + d.y + ")"; });
  }

  function updateArcs() {
    this
      .attr("transform", function (d) { return "translate(" + d.data.dx / 2 + ", " + d.data.dy / 2 +")"; })
      .attr("fill", function(d) { return pieColor(d.data._id); })
      .attr("class", function(d) { return d.data._id; })
      .attr("d", function (d) { return arc(d); });
  }

  function chart(selection, data) {
    var board = selection.append("svg:svg")
      .style("width", width)
      .style("height", height)
      .attr("id", "treemap");

    var cells = board.data([data]).selectAll("rect")
      .data(treemap);

    var pies = selection.selectAll("g")
      .data(formatShards(cells.data());

    var arcs = pies.selectAll("path")
      .data(function (d) { return pie(d.data.shards); });

    // Enter Cells
    cells.enter().append("rect")
      .attr("id", function(d) { return d.data.name; })
      .attr("class", function(d){ return d.children ? "root cell" : "child cell";});

    // Update Cells
    cells.transition()
      .duration(delay)
      .call(updateCells);

    // Exit Cells
    cells.exit().remove();

    // Enter Pie charts
    pies.enter().append("svg:g");

    // Update Pie charts
    pies.transition()
      .duration(delay)
      .call(updatePies);

    // Exit Pie charts
    pies.exit().remove();

    // Enter Arcs
    arcs.enter().append("svg:path");

    // Update Arcs
    arcs.transition()
      .duration(delay)
      .call(updateArcs);

    // Exit Arcs
    arcs.exit().remove();
  }
  
  return chart;
}
