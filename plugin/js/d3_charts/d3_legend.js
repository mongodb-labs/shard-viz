// d3_legend.js

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
  "d3"
], function(d3){
  var LegendChart = function(selection) {

    var board = selection;
    var colorSize = 15;

    function updateKeys() {
      this.select("div.color")
        .style("height", colorSize + "px")
        .style("width", colorSize + "px")
        .style("background-color", function(d) { return d.color; })
        .style("float", "left")

      this.select("span.ns")
        .text(function(d) { return d.name; });
    }

    function exitKeys() {
      this.select("div.color")
        .style("background-color", "white")
        .style("height", "0px")
        .style("width", "0px")

      this.select("span.ns")
        .text("");
    }

    function chart(data) {
      var keys = board.selectAll("div.key").data(data);

      // Enter keys
      var keyEnter = keys.enter().append("div")
        .attr("class", "key")
        .style("word-wrap", "break-word")

      keyEnter.append("div")
        .attr("class", "color")
        .style("margin-right", "5px")
        .style("background-color", "white")
        .style("height", colorSize + "px")
        .style("width", colorSize + "px")

      keyEnter.append("span")
        .attr("class", "ns")
        .style("font-family", "Helvetica Neue, Helvetica, Sans")

      //Update keys
      keys.transition().duration(500).call(updateKeys);

      //Exit keys
      keys.exit().transition().duration(500).call(exitKeys).remove();
    }

    return chart;
  }

  return LegendChart;
});