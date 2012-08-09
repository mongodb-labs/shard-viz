// d3_shards.js

define([
  "d3" , 
  "underscore"
] , function( d3 , _ ){

  var ShardChart = function (selection) {  
    var width = parseInt(selection.style("width")),
        height = 500,
        space = 80, // spacing between each stack
        barColor = d3.scale.category20c(), 
        defaultBarHeight = 50,
        barHeight = defaultBarHeight,
        barHeight = 50,
        textSpace = 50, // leading space reserved for text
        textPad = 5, // padding between text and shards
        pad = 10,
        fontSize = 18,
        hover = null, // the current rect being moused over
        delay = 500; // transition delay

    var board = selection.append("svg:svg")
        .attr("id" , "shards-svg")
        .style("width", width)
        .style("height", height)
      .append("svg:g")
        .attr("class", "bars");

        function formatShardsData(collections, shards, chunks) {
          var data = [];
          var byShard = _.groupBy(chunks, 'shard');
          var byCollection = _.groupBy(chunks, 'ns'); 
          for (var i in shards) {
            // Init the collections object for each shard
            shards[i].collections = []; 
            for (var j in collections) {
              shards[i].collections.push({
                name: collections[j]._id,
                lastmod: collections[j].lastmod,
                dropped: collections[j].dropped,
                key: collections[j].key,
                unique: collections[j].unique,
                chunks: []
              });
            }

            // Insert chunks into each collection in each shard
            var numchunks = 0;
            _.each(shards[i].collections, function (collection) {
              for (var j in byShard[shards[i]._id]) {
                if (byShard[shards[i]._id][j].ns == collection.name) {
                  collection.chunks.push(byShard[shards[i]._id][j]);
                  numchunks++;
                }
              }
            });
            shards[i].numchunks = numchunks;
          }
          return shards;
        }          
    function barWidth(value, total) {
      var totalwidth = width - (pad*2);
      return totalwidth * (value/total);
    }

    function barXPos(prevX, prevWidth) {
      return (+prevX==0?pad:+prevX) + +prevWidth; // coerce strings to numbers pad rect if first
    }

    function barYPos(index) {
      return (+index * space) + fontSize + pad; // coerce strings to numbers and pad rect if first
    }

    function textXPos() {
      return pad; 
    }

    function textYPos(index) {
      return (+index * space) + fontSize + pad - textPad; // coerce strings to numbers
    }

    function updateShards() {
      this
        .attr("class", "shard")
        .attr("id", function (d) { return d._id; })
        .attr("data-index", function (d, i) { return i; })
        .attr("data-size", function (d) { return d.numchunks; })
    }

    function updateBars() {
      this
        .attr("class", "collection")
        .attr("id", function(d) { return d.name; })
        .attr("fill", function(d) { return barColor(d.name); })
        .attr("width", function(d) { return barWidth(d.chunks.length, d3.select(this.parentNode).attr("data-size")); })
        .attr("height", barHeight)
        .attr("y", function(d, i) { return barYPos(d3.select(this.parentNode).attr("data-index")); })
        .attr("x", function(d, i) { 
          if (i == 0) {
            return barXPos(0, 0) 
          } else { // return the position offsetted by the previous adjacent bar
            var prev = d3.select(this.parentNode.childNodes[i-1+1]); // add 1 to compensate for the first text element
            return barXPos(prev.attr("x"), prev.attr("width")); 
          }
        });
    }

    /* Helper function to determine which collection the mouse is over.
     * 
     */
    function getRect(coor, g) {
      for (var i = 0; i < g.childNodes.length ; i++) {
        var curr = d3.select(g.childNodes[i]);
        var next = d3.select(g.childNodes[i+1]);
        if (g.childNodes[i].tagName == 'rect') {
      console.log(i); 
      console.log(g.childNodes[i].tagName);
          if (g.childNodes[i+1]) {
            if (+curr.attr("x") <= coor[0] && +next.attr("x") >= coor[0]) {
              return g.childNodes[i];
            }
          } else {
            if (+curr.attr("x") <= coor[0] && (width-pad) >= coor[0]) {
                return g.childNodes[i];
        }
          }
        }
      }
      return null;
    }

    function enterBars() {
      //barEnter.each(function(d) { 
      //    console.log("BAR");
      //  shards
      //    .append("div")
      //    .style("position", "absolute")
      //    .style("z-index", "10")
      //    .attr("class", "tooltip")
      //    .attr("id", function() { console.log(d); return d.name; })
      //    .text("a simple tooltip");
      //})
      this
        .attr("title", function(d) { return "hello"; })
        .attr("class", "tooltip")
        .attr("id", function(d) { return "hello"; })
        .attr("title", function(d) { 
    var rect = d3.select(this);
    console.log(this.x);
    console.log(rect);
    var x = rect.attr("x");
    var y = rect.attr("y");
          selection.append("div")
      .attr("x", function() { return "100px"; })
      .style("top", function() { console.log(x); return x; })
      .style("left", x+"px")
      .style("opacity", "100")
      .text("hello")
            .attr("class", "tooltip")
            .text("a simple tooltip")
        });
    }

    function chart(data) {
      var data = formatShardsData(data.collections , data.shards , data.chunks ); 
      // Enter shards
      var shards = board.selectAll("g.shard").data(data);
      shards.enter()
        .append("svg:g").call(updateShards)

        .append("svg:text")
          .text(function(d) { return d._id; })
          .attr("x", function(d) { textHeight = this.getBBox().height; return textXPos(); })
          .attr("y", function(d, i) { return textYPos(i); })
    .attr("font-family", "Helvetica Neue")
    .attr("font-size", function(d) { return fontSize; })
          .style("color", "black");

      // Enter bars
      var bars = shards.selectAll("rect.collection").data(function(d) { return _.values(d.collections); });

      var barEnter = bars.enter().append("svg:rect");
      barEnter
        .attr("title", function(d) { return "hello"; })
        .attr("class", "tooltip collection")
        .attr("id", function(d) { return "hello"; })
        
      barEnter.transition().duration(delay).call(updateBars);

      // Update shards
      shards.data(data).call(updateShards);

      // Update bars
      bars.data(function(d, i) { return _.values(d.collections); }).call(updateBars);

      // Exit bars
      bars.exit().remove();

      // Exit shards
      shards.exit().remove();
    }

    // formats the given data for a legend view to graph
    chart.legend = function(data) {
      var data = formatShardsData(data.collections , data.shards , data.chunks );
      var colls = _.keys(_.groupBy(_.flatten(_.pluck(data, "collections"), true), "name"));
      var colors = _.map(colls, barColor);
      return _.map(_.zip(colls, colors), function(i) { return {name: i[0], color: i[1]}; });
    }

    // resize chart according to parent element
    chart.resize = function() {
      var prevWidth = width;
      width = parseInt(selection.style("width"));
      var diff = width / prevWidth;
      selection.select("svg").style("width", width);
      barHeight = ((barHeight * diff) > defaultBarHeight)?defautBarHeight:barHeight * diff;
    }

    chart.destroy = function() {
      board.remove();
    }
    return chart;
  }

  return ShardChart;
});
