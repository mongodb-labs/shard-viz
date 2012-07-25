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
      this.eventAgg.bind( "clean" , this.remove , this);
      this.model.bind( "change" , this.render , this ); // listen for configdata model updates
      this.model.bind( "loaded" , this.render , this);
      $(this.el).addClass( "span8 offset2" );
      this.d3ShardChart = shardChart(d3.select(this.el));  
    } ,
    render : function(){
      this.d3ShardChart( this.model.toJSON() );
      return this;
    } ,
    remove : function(){
      d3.select("#shards-svg").remove();
    }
  });

  return ShardsView;  

});