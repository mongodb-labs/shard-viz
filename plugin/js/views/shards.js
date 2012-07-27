// shards.js

// collections.js

define([
  "jquery",
  "underscore",
  "backbone",
  "d3",
  "views/timeslider",
  "d3_shards",
  "util"
], function( $ , _ , Backbone , d3 , TimesliderView){

  var ShardsView = Backbone.View.extend({
    initialize : function(options){
      if(options.parent){
        this.parent = true;
        $("#leftMargin").addClass("span2");
        $("#rightMargin").addClass("span2");
        $(this.el).addClass("span8");
      }
      this.eventAgg = options.eventAgg;
      this.eventAgg.bind( "router:clean" , this.destroy , this);
      this.model.bind( "configdata:replay" , this.render , this );
      this.model.bind( "configdata:fetch" , this.render, this);
      this.model.bind( "configdata:loaded" , this.render , this);
      this.d3ShardChart = shardChart(d3.select(this.el));
      if(options.slider){
        $(this.el).append("<div id=slider><button id='in'> Zoom in</button><button id='out'> Zoom out</button></div>");
        this.slider = new TimesliderView({ el : $("#slider") , model : this.model , eventAgg : options.eventAgg });
      }
    } ,
    render : function(){
      this.d3ShardChart( this.model.toJSON() );
      return this;
    } ,
    destroy : function(){
      if(this.parent){
        $("#leftMargin").removeClass("span2");
        $("#rightMargin").removeClass("span2");
        $(this.el).removeClass("span8");
      }
      d3.select("#shards-svg").remove();
      this.eventAgg.unbind( "router:clean" , this.destroy);
      this.model.unbind( "configdata:replay" , this.render);
      this.model.unbind( "configdata:fetch" , this.render);
      this.model.unbind( "configdata:loaded" , this.render);
      if(this.slider){
        $("#slider").remove();
      }
    }
  });

  return ShardsView;  

});