// d3_collections.js

define([
  "d3" ,
  "underscore"
], function( d3 , _){

  var CollectionsChart = function ( selection ) {
    var width = parseInt(selection.style("width")),
        height = 500,
        delay = 150, // transition delay in milliseconds
        cellColor = d3.scale.category20b(),
        pieColor = d3.scale.category10();
        pieScale = 0.02, // percent of smallest dimension of cell that pie will space for
        fontSize = 18,
        zoomedFontSize = 24, 
        pad = 5, // padding inside each cell collection (for titles)
        zoomedPad = 9,
        zoomed = null; // g id of zoomed cell

    var treemap = d3.layout.treemap()
      .size([width, height])
      .sticky(false)
      .children(function(d) { return d.children; })
      .value(function(d) { return d.size; });

    var zoomedArc = d3.svg.arc()
      .innerRadius(function() { return Math.ceil((Math.min(height, width)/2) - (pieScale * Math.min(height, width))); })
      .outerRadius(function() { var innerRadius = 
                                 ((Math.min(height, width)/2) - (pieScale * Math.min(height, width)));
                                 return Math.ceil(innerRadius - (innerRadius/2.5)); });

    var arc = d3.svg.arc()
      .innerRadius(function(d) { return Math.ceil((Math.min(d.data.dy, d.data.dx)/2) - (pieScale * Math.min(height, width))); })
      .outerRadius(function(d) { var innerRadius = 
                                 ((Math.min(d.data.dy, d.data.dx)/2) - (0.02 * Math.min(height, width)));
                                 return Math.ceil(innerRadius - (innerRadius/2.5)); });
    
    var pie = d3.layout.pie().sort(null)
      .value(function(d) { return d.chunks.length; });
    
    var board = selection.append("svg:svg")
        .attr("id" , "collections-svg")
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

    function formatCollectionsData( collections , shards , chunks ){
      var data = {};
      data.name = "root";
      data.children = [];
      
      // Count chunks and shards for each collection
      for (var i in collections) {
        if (collections[i].dropped) continue; //skip dropped collections
         
          var child = {};
          child.name = collections[i]._id;
          child.shards = [];
          child.size = 0;
          
          // Count chunks
          for (var j in chunks) {
            if (child.name == chunks[j].ns) {
              child.size++;
        }
    }
    
    // Group a collection's shards and chunks
      for (var k in shards) {
        shards[k].chunks = [];
        for (var l in chunks) {
          if (shards[k]._id == chunks[l].shard && chunks[l].ns == child.name) {
            shards[k].chunks.push(chunks[l]);
            }
          }
          if (shards[k].chunks.length > 0) {
            child.shards.push(new clone(shards[k]));
            }
          }
          data.children.push(child);
        }
      return data;
    }

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
        .style("fill", function(d) { return d.children ? "white" : cellColor(d.data.name); })
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

    // zoom cell to fit entire drawboard
    function zoomCell() {
      this
        .attr("fill", function(d) { return cellColor(d.data.name); })
        .attr("x", function(d) { return "0px"; })
        .attr("y", function(d) { return "0px"; })
        .attr("width", width + "px")
        .attr("height", height + "px");
    }

    // position based on data (used together with zoomCell() when animating a cell zoom)
    function placeCell() {
      this
        .attr("fill", function(d) { return cellColor(d.data.name); })
        .attr("x", function(d) { return d.x + "px"; })
        .attr("y", function(d) { return d.y + "px"; })
        .attr("width", function(d) { return Math.max(0, d.dx - 1) + "px"; })
        .attr("height", function(d) { return Math.max(0, d.dy - 1) + "px"; })
    }

    function zoomPie() {
      this
        .attr("width", width) 
        .attr("height", height)
        .attr("transform", "translate(0,0)")
    }

    function placePie() {
      this
        .attr("width", function(d) { return d.dx; })
        .attr("height", function(d) { return d.dy; })
        .attr("transform", function (d) { return "translate(" + d.x + ", " + d.y + ")"; });
    }

    function placeArcs() {
      this
        .attr("transform", function (d) { return "translate(" + d.data.dx / 2 + ", " + d.data.dy / 2 +")"; })
        .attr("fill", function(d) { return pieColor(d.data._id); })
        .attr("class", function(d) { return d.data._id; })
        .attr("d", function(d) { return arc(d); });
    }

  function placeText() {
    this
      .text(function(d) { return (d.children) ? "" : d.data.name; })
      .attr("x", function(d) { return d.x + pad + "px"; })
      .attr("y", function(d) { return d.y + fontSize + "px"; })
      .attr("text-anchor", "left")
      .style("font-size", fontSize)
      .style("font-family", "Helvetica Neue, Helvetica, sans-serif");
  }

  function zoomText() {
    this
      .text(function(d) { return (d.children) ? "" : d.data.name; })
      .attr("x", function() { return zoomedPad + "px"; })
      .attr("y", function() { return zoomedFontSize + "px"; })
      .style("font-size", zoomedFontSize);
  }

    function zoomArcs() {
      this
        .attr("transform", function () { return "translate(" + width / 2 + ", " + height / 2 +")"; })
        .attr("fill", function(d) { return pieColor(d.data._id); })
        .attr("class", function(d) { return d.data._id; })
        .attr("d", function(d) { return zoomedArc(d); });
    }

    function zoom(d) {
      // Unzoom
      if ( zoomed && d3.select(this).attr("class").search("zoomed") != -1) {
        zoomed = null;
        var z = d3.select(".zoomed");
        z.select("rect.cell")
          .transition().duration(delay)
      .call(placeCell);

      z.select("text.ns")
        .transition().duration(delay)
          .call(placeText);

        z.select("g.pie").selectAll("path")
          .transition().duration(delay)
      .call(placeArcs);

        z.select("g.pie")
          .transition().duration(delay)
      .call(placePie);

        z.transition().duration(delay).remove();

      } else { // Zoom
        // create a new cell and pie chart, then position new group on current position, then animate the zooming
        zoomed = d3.select(this).attr("id");
        var z = d3.select("#treemap").append("svg:g")
      .attr("class", "zoomable zoomed")
      .data([d]);

        // create the rect and animate zooming
        z
          .append("rect")
            .attr("class", function(d) { return "cell"; })
      .call(placeCell)
          .transition().duration(delay)
      .call(zoomCell);

      // create the text and animate zooming
      z
        .append("svg:text")
          .attr("class", "ns")
          .call(placeText)
        .transition().duration(delay)
          .call(zoomText)

        // create the pie chart and animate zooming
        z
          .append("svg:g")
            .attr("class", "pie")
      .call(placePie)
          .transition().duration(delay) 
            .call(zoomPie); 

        // create the arcs of the pie chart and animate zooming
        z.select("g.pie") // can't chain call onto previous block because .call(zoomPie) does not return the resulting selection
    .selectAll("path").data(function(d) { return pie(d.data.shards); }).enter().append("svg:path")
      .call(placeArcs)
          .transition().duration(delay)
      .call(zoomArcs);


        d3.selectAll("g.zoomable").on("click", zoom);
      }
    }

    function redraw() {
      d3.select("#viewport").attr("transform",
          "translate(" + d3.event.translate + ")"
          + " scale(" + d3.event.scale + ")");
    }

    function chart( data ) {
      
      var data = formatCollectionsData( data.collections , data.shards , data.chunks );

      var cells = board.data([data]).selectAll("g.collection")
        .data(treemap);

      // Enter Cells
      var cellEnter = cells.enter().append("svg:g")
          .attr("id", function(d) { return d.data.name.replace(/\./g,''); })
          .attr("class", function(d){ return d.children ? "root collection" : "child collection zoomable"; });
      cellEnter
        .append("rect")
          .attr("class", "cell");
      
      formatShards(cells.data()); // add dx and dy to each shard

      // Update Cells
      cells.transition() // the zoomed is getting in here. 
        .duration(function(d) { return delay; })
        .call(updateCells);

      // Exit Cells
      cells.exit().remove();

      // Update and enter pies and arcs
      cells.each(function (d) {
        if (d.children) return;

        var cell = d3.select(this);
        var pies = d3.select(this).selectAll("g.pie").data(cell.data());
        pies.enter().append("svg:g")
          .attr("class", function(d) { return "pie " + d.data.name.replace(/\./g, ""); });

        // Update Pie charts
        pies.filter(function(d) { return d.data.name == zoomed ? false : true; }).transition().duration(delay)
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
          //.duration(delay)
          .call(updateArcs);
        });
      
        // Zooming
        d3.selectAll("g.zoomable").on("click", zoom);
    
        // Update Zoomed object
        if (zoomed) {
          var z = d3.select(".zoomed");
          var id = z.data()[0].data.name.replace(/\./g,'');
          var data = d3.select("#"+id).data();
          z.data(data);
    
          z.select("g.pie")
            .selectAll("path").data(function(d) { return pie(d.data.shards); }).enter().append("svg:path");
    
          z.select("g.pie")
            .selectAll("path")
        .call(zoomArcs);
        }
    }

    // Returns data formatted for two legends: shards and collections as an object.
    chart.legend = function(data) {
      var data = formatCollectionsData( data.collections , data.shards , data. chunks);
      var result = {"shards": [], "collections" : []};
      var colls = _.pluck(data.children, "name")
      var collColors = _.map(colls, cellColor);
      var shards = []; 
      _.each(data.children, function(child) { 
        shards.push(_.pluck(child.shards, "_id"));
      });
      shards = _.uniq(_.flatten(shards));
      var shardColors = _.map(shards, pieColor);
      result.collections = _.map(_.zip(colls, collColors), function (i) { return {name: i[0], color: i[1]}; });
      result.shards = _.map(_.zip(shards, shardColors), function (i) { return {name: i[0], color: i[1]}; }); 
      // console.log(result)
      return result;
    }

    return chart;
  }

  return CollectionsChart;  
});
