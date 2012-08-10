// timeslider.js

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
  "d3_charts/d3_slider"
], function( $ , _ , Backbone , d3 , TimeSlider ){

  var TimesliderView = Backbone.View.extend({

    initialize : function(options){
      this.eventAgg = options.eventAgg;
      this.eventAgg.bind( "router:clean" , this.destroy , this );
      //this.eventAgg.bind( "router:resize" , this.resize , this );
      $(this.el).append("<i id='in' class='icon-plus-sign'></i><i id='out' class='icon-minus-sign'></i>");
      this.slider = TimeSlider( d3.select(this.el) , this.eventAgg );
      this.model.bind( "configdata:fetch" , this.render, this );
      this.model.bind( "configdata:loaded" , this.render , this );
      return this;
    } ,
    render : function(){
      this.slider(this.model.get("changeLog"));
    } , 
    resize : function(){
      this.slider.destroy();
      d3.select("#slider-svg").remove();
      this.slider = TimeSlider( d3.select(this.el) , this.eventAgg );
      this.slider(this.model.get("changeLog"));
    } ,
    destroy : function(){
      this.slider.destroy();
      d3.select("#slider-svg").remove();
      this.eventAgg.unbind( "router:clean" , this.destroy );
      this.eventAgg.unbind( "router:resize" , this.destroy );
      this.model.unbind( "configdata:fetch" , this.render );
      this.model.unbind( "configdata:loaded" , this.render );
    }
  });

  return TimesliderView;  

});