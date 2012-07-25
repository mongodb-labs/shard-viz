function shardChart(selection) {
  var width = 1024,
      height = 700,
      space = 100, // spacing between each stack
      barColor = d3.scale.category20c(), 
      barHeight = 50,
      textSpace = 50, // leading space reserved for text
      textPad = 5, // padding between text and shards
      pad = 10,
      fontSize = 18,
      hover = null, // the current rect being moused over
      delay = 500; // transition delay

  var board = selection.append("svg:svg")
      .attr( "id" , "shards-svg" )
      .style("width", width)
      .style("height", height)
    .append("svg:g")
      .attr("class", "bars");
    
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
    // Enter shards
    var shards = board.selectAll("g.shard").data(data);
    shards.enter()
      .append("svg:g").call(updateShards)
        .on("mouseover", function (d, i) {
      hover = getRect(d3.mouse(this), this); 
      d3.select(hover).attr("fill", "gray");
      console.log(hover);
      $(hover).tooltip('show');
  })
        .on("mouseout", function(d, i) {
           var rect = getRect(d3.mouse(this), this);
     d3.select(rect).attr("fill", function(d) { return "white"; });
  })
      .append("svg:text")
        .text(function(d) { return d._id; })
        .attr("x", function(d) { textHeight = this.getBBox().height; return textXPos(); })
        .attr("y", function(d, i) { return textYPos(i); })
  .attr("font-family", "Helvetica Neue")
  .attr("font-size", function(d) { console.log(this.getBBox()); return fontSize; })
        .style("color", "black");

    // Enter bars
    var bars = shards.selectAll("rect.collection").data(function(d, i) { return d.collections; });
    var barEnter = bars.enter().append("svg:rect");
    barEnter
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

  return chart;
}
