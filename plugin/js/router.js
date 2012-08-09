// router.js

define([
  "jquery",
  "underscore",
  "backbone",
  "models/configdata",
  "views/welcome",
  "views/header",
  "views/loading",
  "views/dashboard",
  "views/collections",
  "views/shards",
  "views/settings",
  "util"
], function( $ , _ , Backbone , ConfigData , WelcomeView, HeaderView , LoadingView , DashboardView , CollectionsView , ShardsView , SettingsView ){
  
  var AppRouter = Backbone.Router.extend({
    routes: {
      "" : "dashboard",
      "collections": "collections",
      "shards" : "shards",
      "settings" : "settings"
    },
    initialize : function(){
      this.eventAgg = _.extend({} , Backbone.Events); // Global event aggregator
      this.eventAgg.bind("welcome:update" , this.loadDefaults , this);

      var self = this;
      $(window).on( "resize" , function(){
        self.eventAgg.trigger("router:resize");
      })

      this.configData = new ConfigData({ eventAgg : this.eventAgg }); // Data model

      if(!getPersistedItem("configUrl")){
        this.welcomeView = new WelcomeView({ el : $("#content") , eventAgg : this.eventAgg });
      } else {
        this.loadDefaults();
      }

    },
    dashboard : function(){
      if(!this.configured){
        return;
      }
      this.eventAgg.trigger("router:clean");
      this.dashboardView = new DashboardView({ el : $("#content") , 
                                               model : this.configData , 
                                               eventAgg : this.eventAgg });
      if( this.configData.initLoad){
        this.dashboardView.render();
      }
      this.headerView.select("dashboard-menu");
    },
    collections : function(){
      this.eventAgg.trigger("router:clean");
      this.collectionsView = new CollectionsView({ el : $("#content") , 
                                                   model : this.configData , 
                                                   eventAgg : this.eventAgg , 
                                                   parent : true , 
                                                   slider : true ,
                                                   legend : true ,
                                                   time_module : true });
      if(this.configData.initLoad){
        this.collectionsView.render();
      }
      this.headerView.select("collections-menu");
    },
    shards : function(){
      this.eventAgg.trigger("router:clean");
      this.shardsView = new ShardsView({ el : $("#content") , 
                                         model : this.configData , 
                                         eventAgg : this.eventAgg , 
                                         parent : true , 
                                         slider : true ,
                                         legend : true ,
                                         time_module : true });
      if(this.configData.initLoad){
        this.shardsView.render();
      }
      this.headerView.select("shards-menu");
    } ,
    loadDefaults : function(){
      this.configured = true;
      this.headerView = new HeaderView({ el : $(".header") });
      this.settingsView = new SettingsView({ el : $("body") , 
                                             content : $("#content") , 
                                             eventAgg : this.eventAgg });
      if( !this.configData.initLoad ){
        this.loadingView = new LoadingView({ el : $("#content") , 
                                             model : this.configData });
      }
      this.dashboard();
    }
  });

  var initRouter = function(){
    var app_router = new AppRouter;
    Backbone.history.start();
  };

  return { 
    initialize: initRouter
  };

});