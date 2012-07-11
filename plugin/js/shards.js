function shardChart(selection) {
  var width = 1024,
      height = 700,
      space = 100, // spacing between each stack
      barColor = d3.scale.category10(), 
      barHeight = 50,
      pad = 10,
      delay = 250;

  var board = selection.append("svg:svg")
      .style("width", width)
      .style("height", height)
    .append("svg:g")
      .attr("class", "bars");
    
  function barWidth(value, total) {
    var totalwidth = width - pad;
    console.log(total);
    return totalwidth * (value/total);
  }

  function barXPos(prevX, prevWidth) {
    return +prevX + +prevWidth; // coerce each string to numbers
  }

  function chart(data) {
    var shards = board.selectAll("g.shard").data(data);

    // Enter bars
    var bars = shards.enter()
      .append("svg:g")
        .attr("class", "shard")
	.attr("id", function (d) { return d._id; })
	.attr("data-index", function (d, i) { return i; })
	.attr("data-size", function (d) { return d.numchunks; })
      .selectAll("rect.collection").data(function(d, i) { return _.values(d.collections); }).enter()
      .append("svg:rect")
        .attr("class", "collection")
	.attr("fill", function(d) { return barColor(d[0].ns); })
	.attr("width", function(d) { console.log(d3.select(this.parentNode)); return barWidth(d.length, d3.select(this.parentNode).attr("data-size")); })
	.attr("height", barHeight)
	.attr("y", function(d, i) { return d3.select(this.parentNode).attr("data-index") * space; })
	.attr("x", function(d, i) { 
	  if (i == 0) {
	    return barXPos(0, 0) 
	  } else { // return the position offsetted by the previous adjacent bar
	    var prev = d3.select(this.parentNode.childNodes[i-1]);
	    return barXPos(prev.attr("x"), prev.attr("width")); 
	  }
	});

    // Update bars
    shards.data(data)
  }

  return chart;
}
