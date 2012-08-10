// d3_slider.js

// Copyright 2012 Phillip Quiza, Andrei Nagornyi

/**
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

define([
  "d3",
  "underscore"
], function( d3 , _ ){

  var TimeSlider = function( selection , eventAgg ){

    var axisHistory = [] , extentHistory = [] , cursorHistory = [];

    var prevCursorTime;

    var margin = {top: 10, right: 10, bottom: 10, left: 15},
        margin2 = {top: 10, right: 10, bottom: 20, left: 15},
        width = parseInt(selection.style("width")) - margin.left - margin.right,
        height = 100 - margin.top - margin.bottom;
        height2 = 100 - margin2.top - margin2.bottom;

    var x = d3.time.scale().range([0, width]);

    var xAxis = d3.svg.axis().scale(x).orient("bottom");

    var brush = d3.svg.brush()
        .x(x)
        .on("brush", brush);
    
    var drag = d3.behavior.drag()
      .on("dragstart" , setPrevCursorTime)
      .on("drag", dragmove )
      .on("dragend", replay );

    var area = d3.svg.area()
        .interpolate("monotone")
        .x(function(d) { return x(d.date); })
        .y0(height2);

    var svg = selection.append("svg")
        .attr("id" , "slider-svg")
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

    var brushSel = d3.select(".x.brush");
    var brushRect = brushSel.select(".background");

    context.append("rect")
        .attr("id" , "cursor")
        .attr("fill" , "deepskyblue")
        .attr("width" , "10")
        .attr("height" , height2 )
        .call(cursorSnapToRight)
        .call(drag);

    function cursorSnapToRight( rect ){
      var rect = this;
      var rect = this;
      var rw = parseInt(rect.attr("width"));
      var bw = parseInt(brushRect.attr("width"));
      this.attr("x" , (bw - rw + 1) + "");
      setPrevCursorTime();
    }

    function chart(data){
      var data = _.map( data , function(item){ return item.time.$date; });
      updateSlider( d3.extent(data.map(function(d) { return d; })) );
    }

    d3.select("#in").on("click" , brushZoomIn);
    d3.select("#out").on("click" , brushZoomOut);

    function updateSlider( extent ){
      x.domain(extent);
      context.select(".x.axis").transition().call(xAxis);
      //d3.select(".brush").call(brush.clear());
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
      cursorHistory.push(d3.select(cursor).attr("x"));
      updateSlider(brush.extent());
      d3.select(".brush").call(brush.clear());
      d3.select("#cursor").call(cursorSnapToRight);
    }

    function brushZoomOut(){
      if( axisHistory.length == 0 ) return;
      updateSlider(axisHistory.pop());
      if( extentHistory.length != 0) d3.select(".brush").call( brush.extent(extentHistory.pop()));
      d3.select(cursor).attr("x" , cursorHistory.pop() );
    }

    function setPrevCursorTime(){
      var cursor = d3.select("#cursor");
      var curLocation = parseInt(cursor.attr("x"));
      var width = parseInt(brushRect.attr("width"));
      var domain = x.domain();
      var leftBound = domain[0].valueOf();
      var rightBound = domain[1].valueOf();

      var curTime = Math.floor(curLocation  * (rightBound - leftBound) / width + leftBound);
      prevCursorTime = curTime;
    }

    function replay(){
      var cursor = d3.select("#cursor");
      var curLocation = parseInt(cursor.attr("x"));
      var width = parseInt(brushRect.attr("width"));
      var domain = x.domain();
      var leftBound = domain[0].valueOf();
      var rightBound = domain[1].valueOf();

      var curTime = Math.floor(curLocation * (rightBound - leftBound) / width + leftBound);
      //console.log("SlideEnd  " , curTime );
      eventAgg.trigger("timeslider:move" , { curTime : curTime , prevTime : prevCursorTime });
      eventAgg.trigger("timeslider:stop_fetch");
    }

    chart.destroy = function(){
      d3.select("#in").on("click" , null);
      d3.select("#in").on("click" , null);
      d3.behavior.drag()
        .on("dragstart" , null)
        .on("drag", null)
        .on("dragend", null);
      d3.select("#slider-svg").remove();
    }

    return chart;
  }

  return TimeSlider;

});