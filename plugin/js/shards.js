function shards(selection) {
  var width = 1024,
      height = 700,
      pad = 10,
      delay = 250;

  var board = selection.append("svg:svg")
      .style("width", width)
      .style("height", height)
    .append("svg:g")
      .attr("class", "bars")

    
  function chart(data) {
    var x = d3.scale.linear().domain([0, data.length]).range([pad, width - pad])
    var bars = board.select("g.bars")
      .selectAll("g.shard").data(data).enter()
      .append("svg:g");
        .attr("class", "shard")
      .selectAll("rect.collection").data(function(d) { console.log(d); return _.values(d.collections); }).enter()
      .append("svg:rect")
        .attr("class", "collection");
  }
  return chart;
}
