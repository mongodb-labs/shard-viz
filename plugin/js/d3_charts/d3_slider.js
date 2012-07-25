// d3_slider.js

define([
  "d3",
  "underscore"
], function( d3 , _ ){

  var TimeSlider = function( selection , eventAgg ){

    var brushSel , brushRect;

    var axisHistory = [] , extentHistory = [];

    var margin = {top: 10, right: 10, bottom: 10, left: 15},
        margin2 = {top: 10, right: 10, bottom: 20, left: 15},
        width = parseInt(selection.style("width")) - margin.left - margin.right,
        height = 100 - margin.top - margin.bottom;
        height2 = 100 - margin2.top - margin2.bottom;

   //var formatDate = d3.time.format("%b %Y");

    var x = d3.time.scale().range([0, width]);

    var xAxis = d3.svg.axis().scale(x).orient("bottom");

    var brush = d3.svg.brush()
        .x(x)
        .on("brush", brush);
    
    var drag = d3.behavior.drag()
      .on("drag", dragmove);

    var area = d3.svg.area()
        .interpolate("monotone")
        .x(function(d) { return x(d.date); })
        .y0(height2);

    var svg = selection.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    var context = svg.append("g")
        .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

    context.append("g")
        .attr("class", "x brush")
        .call(brush)
      .selectAll("rect")
        // .attr("y", -6)
        .attr("height", height2);

    context.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height2 + ")")
        .call(xAxis);

    context.append("rect")
        .attr("id" , "cursor")
        .attr("fill" , "deepskyblue")
        .attr("width" , "10")
        .attr("height" , height2 )
        .attr("x" , "0")
        .call(drag);

    brushSel = d3.select(".x.brush");
    brushRect = brushSel.select(".background");

    function chart(data){
      var data = _.map( data , function(item){ return new Date(item.time.$date); });
      updateSlider( d3.extent(data.map(function(d) { return d; })) );
    }

    d3.select("#in").on("click" , brushZoomIn);
    d3.select("#out").on("click" , brushZoomOut);

    function updateSlider( extent ){
      x.domain(extent);
      context.select(".x.axis").transition().call(xAxis);
      d3.select(".brush").call(brush.clear());
    }

    function dragmove(d){
      var rect = d3.select(this);
      var rx = parseInt(rect.attr("x"));
      var rw = parseInt(rect.attr("width"));
      var bx = parseInt(brushRect.attr("x"));
      var bw = parseInt(brushRect.attr("width"));

      rect.attr("x" , Math.max( 0 , Math.min( bw - rw + 1, d3.event.x )));
    }

    function brushZoomIn(){
      if(brush.empty()) return;
      axisHistory.push(x.domain());
      extentHistory.push(brush.extent());
      updateSlider(brush.extent());
      d3.select(".brush").call(brush.clear());
    }

    function brushZoomOut(){
      if( axisHistory.length == 0 ) return;
      updateSlider(axisHistory.pop());
      if( extentHistory.length != 0) d3.select(".brush").call( brush.extent(extentHistory.pop()));
    }

    return chart;
  }

  return TimeSlider;

});