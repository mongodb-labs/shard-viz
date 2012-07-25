// configdata.js

define([
  "jquery",
  "underscore",
  "backbone",
  "async",
  "util"
], function( $ , _ , Backbone , async ) {
  var ConfigData = Backbone.Model.extend({
    defaults: {
      chunks : {},
      shards : {},
      collections : {},
      changeLog : []
    },
    initialize : function(){
      this.fetchDefaults();
    } ,
    // parse : function(response){
    //   //console.log("PARSING")
    //   var attrs = {};
    //   attrs.changeLog = response.rows;
    //   // console.log(this.attributes.changeLog);
    //   // console.log(attrs.changeLog.length);
    //   // if( //typeof attrs.changeLog[this.prevChangeLogLen] == "undefined" || 
    //   //     this.attributes.changeLog[this.prevChangeLogLen - 1]._id != attrs.changeLog[this.prevChangeLogLen - 1]._id){
    //   //   this.fetchDefaults();
    //   // } else 
    //   if(this.prevChangeLogLen < attrs.changeLog.length){
    //     this.updateAttributes( attrs.changeLog.slice( this.prevChangeLogLen , attrs.changeLog.length ) );
    //     this.prevChangeLogLen = this.attributes.changeLog.length;
    //     return attrs;
    //   }
    // },
    // fetch : function(){
    //   console.log("FETCHING");
    //   this.attributes.prevChangeLogLen = this.attributes.changelog.length;
    //   var url = this.url + "/config/changelog/?limit=0";
    //   return Backbone.Collection.prototype.fetch(this, {url : url});
    // },
    fetchDefaults : function(){
      var self = this;
      var urls = { chunks : this.url + "/config/chunks/?limit=0",
                   shards : this.url + "/config/shards/" ,
                   collections : this.url + "/config/collections/" ,
                   changeLog : this.url + "/config/changelog/?limit=0" };

      var syncSuccess = function( attr , response , cb ){ 
        this[attr] = response.rows;
        cb();
      }

      var syncError = function( cb ){
        cb();
      }

      var iter = function( item , cb ){ 
        Backbone.sync( "read" , 
                       self , 
                       { url : urls[item] , 
                         success : function(response){ self.attributes[item] = response.rows; cb(); } ,
                         error : function(){ cb(); } } ) }; 

      async.forEach( _.keys(urls) , iter , function(err){ 
        if(!err){

          var chunkMap = {} ,
              shardMap = {}
              collectionsMap = {};
          
          _.each( self.attributes.chunks , function(chunk){
            chunkMap[ genChunkKey( chunk.ns , chunk.min ) ] = chunk;
          });
          self.attributes.chunks = chunkMap;
          
          _.each( self.attributes.shards , function(shard){
            shardMap[shard._id] = shard;
          });
          self.attributes.shards = shardMap;

          _.each( self.attributes.collections , function(collection){
            collectionsMap[collection._id] = collection;
          })
          self.attributes.collections = collectionsMap;
          
          self.prevChangeLogLen = self.attributes.changeLog.length;
          console.log(self.prevChangeLogLen);
          self.initLoad = true;
          if(!self.timerId){
            self.timerId = setInterval( function(){ self.fetch({url : self.url + "/config/changelog/?limit=0" }); } , 500 , this);
          }
          self.trigger( "loaded" );
        } 
      }); 
    } ,

    fetch : function(){
      var self = this;
      var urls = { chunks : this.url + "/config/chunks/?limit=0",
                   shards : this.url + "/config/shards/" ,
                   collections : this.url + "/config/collections/" ,
                   changeLog : this.url + "/config/changelog/?limit=0" };

      var syncSuccess = function( attr , response , cb ){ 
        this[attr] = response.rows;
        cb();
      }

      var syncError = function( cb ){
        cb();
      }

      var iter = function( item , cb ){ 
        Backbone.sync( "read" , 
                       self , 
                       { url : urls[item] , 
                         success : function(response){ self.attributes[item] = response.rows; cb(); } ,
                         error : function(){ cb(); } } ) }; 

      async.forEach( _.keys(urls) , iter , function(err){ 
        if(!err){

          var chunkMap = {} ,
              shardMap = {}
              collectionsMap = {};
          
          _.each( self.attributes.chunks , function(chunk){
            chunkMap[ genChunkKey( chunk.ns , chunk.min ) ] = chunk;
          });
          self.attributes.chunks = chunkMap;
          
          _.each( self.attributes.shards , function(shard){
            shardMap[shard._id] = shard;
          });
          self.attributes.shards = shardMap;

          _.each( self.attributes.collections , function(collection){
            collectionsMap[collection._id] = collection;
          })
          self.attributes.collections = collectionsMap;

          self.trigger( "change" );
        } 
      }); 
    } ,
    updateAttributes : function( changeLogDelta ){
      var self = this;
      _.each( changeLogDelta , function( entry ){
        if( typeof self.attributes.collections[entry.ns] == "undefined" ){
          self.attributes.collections[entry.ns] = { _id : entry.ns , 
                                                    dropped : 
                                                    false , 
                                                    lastmod : entry.time };
        }
        switch( entry.what ){
          case "split" : {
            var oldChunk = self.attributes.chunks[ genChunkKey( entry.ns , entry.details.before.min ) ];
            if( typeof oldChunk == "undefined" ){
              console.log(entry);
              var chunk = { _id : entry.ns + "_id" + guidGenerator() ,
                            lastmod : entry.details.before.lastmod ,
                            ns : entry.ns ,
                            min : entry.details.before.min ,
                            max : entry.details.before.max };

              self.attributes.chunks[ genChunkKey( entry.ns , entry.details.before.min ) ] = chunk;
              oldChunk = chunk;
            }
            var shard = oldChunk.shard;
            // Remove old chunk
            delete oldChunk;
            // Generate new chunks
            var leftChunk = { _id : entry.ns + "-_id_" + guidGenerator() , 
                              lastmod : entry.details.left.lastmod , 
                              ns : entry.ns , 
                              min : entry.details.left.min ,
                              max : entry.details.left.max , 
                              shard : shard
                            };
            var rightChunk = { _id : entry.ns + "-_id_" + guidGenerator() ,
                               lastmod : entry.details.right.lastmod , 
                               ns : entry.ns , 
                               min : entry.details.right.min ,
                               max : entry.details.right.max ,
                               shard : shard
                             };

            self.attributes.chunks[ genChunkKey( entry.ns , leftChunk.min )] = leftChunk;
            self.attributes.chunks[ genChunkKey( entry.ns , rightChunk.min )] = rightChunk;
          }
          break;
          case "moveChunk.commit" : {

            if( typeof self.attributes.shards[ entry.details.to ] == "undefined" )
              self.attributes.shards[ entry.details.to ] = { _id : entry.details.to };
            if( typeof self.attributes.shards[ entry.details.from ] == "undefined" )
              self.attributes.shards[ entry.details.from ] = { _id : entry.details.from };

            self.attributes.chunks[ genChunkKey( entry.ns , entry.details.min )].shard = entry.details.to;
          }
          break;
          case "dropCollection" : {
            self.attributes.collections[entry.ns].dropped = true;
            //Todo : Remove chunks of dropped collection?
          }
          break;
          case "dropDatabase" : {

          }
        }
      });
    } ,
    toJSON : function(){
      var attrs = {};
      attrs.chunks = _.values(this.attributes.chunks);
      attrs.shards = _.values(this.attributes.shards);
      attrs.collections = _.values(this.attributes.collections);
      return attrs;
    },
    url : "http://127.0.0.1:5004",
    initLoad : false
    
  });
  return ConfigData;

});




























