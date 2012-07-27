// shards.js

// collections.js

define([
  "jquery",
  "underscore",
  "backbone",
  "d3",
  "d3_shards",
  "util"
], function( $ , _ , Backbone , d3 ){

  var ShardsView = Backbone.View.extend({
    initialize : function(options){
      this.eventAgg = options.eventAgg;
      this.eventAgg.bind( "router:clean" , this.remove , this);
      this.model.bind( "configdata:replay" , this.render , this );
      this.model.bind( "configdata:fetch" , this.render, this);
      this.model.bind( "configdata:loaded" , this.render , this);
      $("#leftMargin").addClass("span2");
      $("#rightMargin").addClass("span2");
      $(this.el).addClass("span8");
      this.d3ShardChart = shardChart(d3.select(this.el));  
    } ,
    render : function(){
      this.d3ShardChart( this.model.toJSON() );
      return this;
    } ,
    remove : function(){
      d3.select("#shards-svg").remove();
      this.unbind();
      $("#slider").remove();
      $("#leftMargin").removeClass("span2");
      $("#rightMargin").removeClass("span2");
      $(this.el).removeClass("span8");
    }
  });

  return ShardsView;  

});