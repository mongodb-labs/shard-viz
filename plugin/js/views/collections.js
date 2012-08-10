// collections.js

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
  "jquery",
  "underscore",
  "backbone",
  "d3",
  "views/timeslider",
  "views/legend",
  "d3_collections",
  "util"
], function( $ , _ , Backbone , d3 , TimesliderView , LegendView , CollectionsChart ){

  var CollectionsView = Backbone.View.extend({
    initialize : function(options){
      if(options.parent){
        this.parent = true;
        $("#leftMargin").addClass("span2");
        $("#rightMargin").addClass("span2");
        $(this.el).addClass("span8");
      }
      this.eventAgg = options.eventAgg;
      this.eventAgg.bind( "router:clean" , this.destroy , this);
      this.eventAgg.bind( "router:resize" , this.resize , this);
      this.model.bind( "configdata:replay" , this.render , this );
      this.model.bind( "configdata:fetch" , this.render, this);
      this.model.bind( "configdata:loaded" , this.render , this);
      this.d3CollChart = CollectionsChart(d3.select(this.el));
      if(options.slider){
        $(this.el).append("<div id=slider></div>");
        this.sliderView = new TimesliderView({ el : $("#slider") , model : this.model , eventAgg : options.eventAgg });
        if(this.model.initLoad){
          this.sliderView.render();
        }
      }
      if(options.legend){
        $("#rightMargin").append("<div id=collections-legend></div>");
        $("#collections-legend").append("<h2>" + "Collections" + "</h2>").css("font-family" , "Helvetica Neue, Helvetica, sans-serif")
        $("#rightMargin").append("<div id=shards-legend></div>");
        $("#shards-legend").append("<h2>" + "Shards" + "</h2>").css("font-family" , "Helvetica Neue, Helvetica, sans-serif");
        this.collLegendView = new LegendView({ el : $("#collections-legend") , model : this.model , eventAgg : options.eventAgg , chart : this.d3CollChart , mode : "collections:collections" });
        this.shardLegendView = new LegendView({ el : $("#shards-legend") , model : this.model , eventAgg : options.eventAgg , chart : this.d3CollChart , mode : "collections:shards" });
      }
    } ,
    render : function(){
      var modelData = this.model.toJSON();
      this.d3CollChart( this.model.toJSON() );
      if( this.collLegendView && this.shardLegendView ){
        var data = this.d3CollChart.legend( modelData );
        this.collLegendView.legend(data.collections);;
        this.shardLegendView.legend(data.shards);
      }
      return this;
    } ,
    resize : function(){
      this.d3CollChart.resize();
    } ,
    destroy : function(){
      if(this.parent){
        $("#leftMargin").removeClass("span2");
        $("#rightMargin").removeClass("span2");
        $(this.el).removeClass("span8");
      }
      if(this.collLegendView){
        $("#collections-legend").remove();
      }
      if(this.shardLegendView){
        $("#shards-legend").remove();
      }
      d3.select("#collections-svg").remove();
      this.eventAgg.unbind( "router:resize" , this.resize);
      this.eventAgg.unbind( "router:clean" , this.destroy);
      this.model.unbind( "configdata:replay" , this.render);
      this.model.unbind( "configdata:fetch" , this.render);
      this.model.unbind( "configdata:loaded" , this.render);
      if(this.sliderView){
        $("#slider").remove();
        $("#in").remove();
        $("#out").remove();
      }
    }
  });

  return CollectionsView;  

});