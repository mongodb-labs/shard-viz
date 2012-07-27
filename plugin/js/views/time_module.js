// time_module.js

define([
  "jquery",
  "underscore"
] , function( $ , _ ){

  var TimeModuleView = Backbone.View.extend({

    initialize : function(options){
      this.eventAgg = options.eventAgg;
      this.eventAgg.bind( "router:clean" , this.destroy , this );
      //console.log(this.legend);
      this.model.bind( "configdata:fetch" , this.render, this);
      this.model.bind( "configdata:loaded" , this.render , this);
      this.model.bind( "condigdata:replay" , this.render, this);
      return this;
    } , 
    render : function(){
      $(this.el).append("TIME");
    } , 
    destroy : function(){
      //d3.select("#legend-svg").remove();
      this.eventAgg.unbind("router:clean" , this.destroy);
      this.model.unbind( "configdata:fetch" , this.render );
      this.model.unbind( "configdata:loaded" , this.render );
      this.model.unbind( "configdata:render" , this.render );
    }
  });

  return TimeModuleView;

});