// loading.js

define([
  "jquery",
  "underscore",
  "backbone",
  "bootstrap-modal"
], function( $ , _ , Backbone ){

  var LoadingView = Backbone.View.extend({

    template : _.template($("#loading-tmpl").html()) ,

    initialize : function(){
      $(this.el).html(this.template());
      $("#loadingModal").modal({ keyboard : false , backdrop : "static" });
      this.model.bind( "loaded" , this.closeModal , this );
      //this.model.fetchDefaults();
      return this;
    } ,
    closeModal : function(){
      $("#loadingModal").modal("hide");  
      // $(this.el).children().remove();
    }
    // , 
    // fetchConfigDefaults : function(){
    //   var self = this;
    //   var xhr = function() {
    //     var xhr = $.ajaxSettings.xhr();
    //     xhr.onprogress = self.handleProgress;
    //     return hxr;
    //   }
    //   this.model.fetchDefaults( xhr );
    // } ,
    // handleProgress : function( evt ){
    //   var percentComplete = 0;
    //   if (evt.lengthComputable) {  
    //     percentComplete = evt.loaded / evt.total;
    //   }
    //   console.log(percentComplete);
    // }

  });

  return LoadingView;  

});