function collections( selection ) {

  var width = 1024,
      height = 700,
      delay = 250, // transition delay in milliseconds
      cellColor = d3.scale.category20b(),
      pieColor = d3.scale.category10();
      zoomed = null; // g id of zoomed cell

  var treemap = d3.layout.treemap()
    .size([width, height])
    .sticky(false)
    .children(function(d) { return d.children; })
    .value(function(d) { return d.size; });

  var zoomedArc = d3.svg.arc()
    .innerRadius(function(d) { return Math.ceil((Math.min(height, width)/2) - 20); })
    .outerRadius(function(d) { var innerRadius = 
                               ((Math.min(height, width)/2) - 20);
                               return Math.ceil(innerRadius - (innerRadius/2.5)); });

  var arc = d3.svg.arc()
    .innerRadius(function(d) { return Math.ceil((Math.min(d.data.dy, d.data.dx)/2) - 20); })
    .outerRadius(function(d) { var innerRadius = 
                               ((Math.min(d.data.dy, d.data.dx)/2) - 20);
                               return Math.ceil(innerRadius - (innerRadius/2.5)); });
  
  var pie = d3.layout.pie().sort(null)
    .value(function(d) { return d.chunks.length; });
  
  var board = selection.append("svg:svg")
      .style("width", width)
      .style("height", height)
    .append("svg:g")
      .attr("id", "treemap")
      .attr("width", width)
      .attr("height", height)

  d3.selection.prototype.moveToFront = function() { 
    return this.each(function() { 
    this.parentNode.appendChild(this); 
    }); 
  }; 

  /* Given the output of treemap(formatData()), return a list of shards to be used 
   * for graphing pie charts. Modifies data.data.shards to add dx and dy of parent cell
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
    shard.data.shards[j].collection = data[i].data.name;
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

  function updateCells(d) {
    //Update the rects contained in the g elements
    this.select("rect")
      .style("fill", function(d, i) { return d.children ? null : cellColor(d.data.name); })
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
      .attr("d", function(d) { return arc(d); });
  }

  function updateZoomed() {
    this
      .attr("transform", function (d) { return "translate(" + width / 2 + ", " + height / 2 +")"; })
      .attr("fill", function(d) { return pieColor(d.data._id); })
      .attr("class", function(d) { return d.data._id; })
      .attr("d", function(d) { return zoomedArc(d); });
  }

  function zoom(d) {
    var group = d3.select(this);
    var pie = group.select("g.pie");
    var rect = group.select("rect");
    var data = rect.data()[0];
    // Unzoom
    if ( zoomed && zoomed === group.attr("id")) {
      zoomed = null;
      rect.moveToFront().transition()
        .duration(delay)
          .attr("x", data.x)
          .attr("y", data.y)
          .attr("width", data.dx + "px")
          .attr("height", data.dy + "px")
      pie.moveToFront()
        .transition().duration(delay)
        .call(updatePies).selectAll("path")
  .call(updateArcs);
    } else { // Zoom
      zoomed = group.attr("id");
      group.moveToFront();
      rect//.moveToFront()//.transition()
        //.duration(delay)
          .attr("x", 0)
          .attr("y", 0)
          .attr("width", width + "px")
          .attr("height", height + "px");
      pie//.moveToFront()
        .transition().duration(delay)
    .attr("width", width)
    .attr("height", height)
          .attr("transform", "translate(0,0)")
        .selectAll("path")
          //.attr("transform", "translate(" + width/2 + ", " + height/2 +")")
    //.attr("d", function (d) { return arc(d); })
        .call(updateZoomed); 
    }
  }

  function redraw() {
    d3.select("#viewport").attr("transform",
        "translate(" + d3.event.translate + ")"
        + " scale(" + d3.event.scale + ")");
  }
  var prev = {};
  var old = {};
  var bold = {};
  function chart( data ) {

    var cells = board.data([data]).selectAll("g.collection")
      .data(treemap);

    // Enter Cells
    var cellEnter = cells.enter().append("svg:g")
        .attr("id", function(d) { return d.data.name; })
        .attr("class", function(d){ return d.children ? "root collection" : "child collection"; });
    cellEnter
      .append("rect")
        .attr("class", "cell");
    
    formatShards(cells.data()); // add dx and dy to each shard

    // Update Cells
    cells.filter(function(d) { return d.data.name==zoomed ? false:true; }).transition()
      .duration(delay)
      .call(updateCells);

    // Exit Cells
    cells.exit().remove();

    // Enter pies and arcs
    cellEnter.filter(function(d) { return d.data.name==zoomed ? false:true; }).each(function(d) {
      if (d.children) return;

      var cell = d3.select(this);
      var pies = d3.select(this).selectAll("g.pie").data(cell.data());
      pies.enter().append("svg:g")
        .attr("class", function(d) { return "pie " + d.data.name.replace(/\./g, ""); });

      // Update Pie charts
      pies.filter(function(d) { return d.data.name == zoomed ? false : true; }).transition()
        .duration(delay)
  .call(updatePies);

      var arcs = pies.selectAll("path")
        .data(function (d) { return pie(d.data.shards); });

      // Enter Arcs
      arcs.enter().append("svg:path")
        .each(function(d){ this._current = d; });

      // Update Arcs
      arcs.transition()
        .duration(delay)
        .call(updateArcs);

      // Exit Arcs
      arcs.exit().remove();

    });

    // Update pies and arcs
    cells.filter(function(d) { return d.data.name==zoomed ? false:true; }).each(function (d) {
      console.log(this);
      if (d.children) return;

      var cell = d3.select(this); 
      var pies = d3.select(this).selectAll("g.pie").data(cell.data());

      // Update Pie charts
      pies.filter(function(d) { return d.data.name == zoomed ? false : true; }).transition()
        .duration(delay)
  .call(updatePies);

      var arcs = pies.selectAll("path")
        .data(function (d) { return pie(d.data.shards); });

      // Update unzoomed arcs
      arcs.filter(function(d) { return (d.data.collection == zoomed) ? false : true; })//.transition()
//  .duration(delay)
  .call(updateArcs);
    });
    
    // Zooming
    d3.selectAll("g.child.collection").on("click", zoom);
  }
  
  return chart;
}
