function shardChart(selection) {
  var width = 1024,
      height = 700,
      space = 100, // spacing between each stack
      barColor = d3.scale.category20(), 
      barHeight = 50,
      textSpace = 50, // leading space reserved for text
      textPad = 10, // padding between text and shards
      pad = 10,
      delay = 500; // transition delay

  var board = selection.append("svg:svg")
      .style("width", width)
      .style("height", height)
    .append("svg:g")
      .attr("class", "bars");
    
  function barWidth(value, total) {
    var totalwidth = width - (pad*2) - textSpace;
    return totalwidth * (value/total);
  }

  function barXPos(prevX, prevWidth) {
    return (+prevX==0?textSpace+textPad:+prevX) + +prevWidth; // coerce strings to numbers pad rect if first
  }

  function barYPos(index) {
    return (+index==0?pad+index*space:+index*space); // coerce strings to numbers and pad rect if first
  }

  function textXPos() {
    return pad; 
  }

  function textYPos(index) {
    return (+index * space); // coerce strings to numbers
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

  function chart(data) {
    // Enter shards
    var shards = board.selectAll("g.shard").data(data);
    shards.enter()
      .append("svg:g").call(updateShards)
      .append("svg:text")
        .text(function(d) { return d._id; })
        .attr("x", function(d) { return textXPos(); })
        .attr("y", function(d, i) { console.log(this); return textYPos(i); })
	.attr("font-family", "Helvetica Neue")
	.attr("font-size", function(d) { console.log(this.getBBox()); return "18"; })
        .style("color", "black");


    // Enter bars
    var bars = shards.selectAll("rect.collection").data(function(d, i) { return d.collections; });
    bars.enter().append("svg:rect").transition().duration(delay).call(updateBars);

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
