// shards.js

// collections.js

define([
  "jquery",
  "underscore",
  "backbone",
  "d3",
  "views/timeslider",
  "views/legend",
  "d3_shards",
  "util"
], function( $ , _ , Backbone , d3 , TimesliderView , LegendView , ShardChart){

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
      this.eventAgg.bind( "router:resize" , this.resize , this);
      this.model.bind( "configdata:replay" , this.render , this );
      this.model.bind( "configdata:fetch" , this.render, this);
      this.model.bind( "configdata:loaded" , this.render , this);
      this.d3ShardChart = ShardChart(d3.select(this.el));
      if(options.slider){
        $(this.el).append("<div id=slider></div>");
        this.sliderView = new TimesliderView({ el : $("#slider") , 
                                               model : this.model , 
                                               eventAgg : options.eventAgg });
        if(this.model.initLoad){
          this.sliderView.render();
        }
      }
      if(options.legend){
        $("#rightMargin").append("<div id=shards-legend></div>");
        $("#shards-legend").append("<h2>" + "Collections" + "</h2>").css("font-family" , "Helvetica Neue, Helvetica, sans-serif");
        this.shardLegendView = new LegendView({ el : $("#shards-legend") , 
                                                model : this.model , 
                                                eventAgg : options.eventAgg , 
                                                chart : this.d3ShardChart , 
                                                mode : "shards" });
      }
    } ,
    render : function(){
      var modelData = this.model.toJSON();
      this.d3ShardChart( modelData );
      if(this.shardLegendView){
        var data = this.d3ShardChart.legend(modelData);
        this.shardLegendView.legend(data);
      }
      return this;
    } ,
    resize : function(){
      this.d3ShardChart.resize();
      this.d3ShardChart(this.model.toJSON());
    } ,
    destroy : function(){
      if(this.parent){
        $("#leftMargin").removeClass("span2");
        $("#rightMargin").removeClass("span2");
        $(this.el).removeClass("span8");
      }
      if(this.shardLegendView){
        $("#shards-legend").remove();
      }
      d3.select("#shards-svg").remove();
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

  return ShardsView;  

});