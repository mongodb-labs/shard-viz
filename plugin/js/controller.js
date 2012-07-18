// controller.js

var Controller = (function(){

  // Private variables

  var container;
  var source; 
  var dbData;
  var replayData;
  var colls;
  var shrds;

  // Private methods
  
  // Collections view logic
  
  function formatCollectionsData( collections , shards , chunks ){
    var data = {};
    data.name = "root";
    data.children = [];
    
    // Count chunks and shards for each collection
    for (var i in collections) {
      if (collections[i].dropped) continue; //skip dropped collections
       
        var child = {};
        child.name = collections[i]._id;
        child.shards = [];
        child.size = 0;
        
        // Count chunks
        for (var j in chunks) {
          if (child.name == chunks[j].ns) {
            child.size++;
      }
  }
  
  // Group a collection's shards and chunks
    for (var k in shards) {
      shards[k].chunks = [];
      for (var l in chunks) {
        if (shards[k]._id == chunks[l].shard && chunks[l].ns == child.name) {
          shards[k].chunks.push(chunks[l]);
          }
        }
        if (shards[k].chunks.length > 0) {
          child.shards.push(new clone(shards[k]));
          }
        }
        data.children.push(child);
      }
    return data;
  }

  function formatShardsData(collections, shards, chunks) {
    var data = [];
    var byShard = _.groupBy(chunks, 'shard');
    var byCollection = _.groupBy(chunks, 'ns'); 
    for (var i in shards) {
      // Init the collections object for each shard
      shards[i].collections = []; 
      for (var j in collections) {
        shards[i].collections.push({
          name: collections[j]._id,
          lastmod: collections[j].lastmod,
          dropped: collections[j].dropped,
          key: collections[j].key,
          unique: collections[j].unique,
          chunks: []
        });
      }

      // Insert chunks into each collection in each shard
      var numchunks = 0;
      _.each(shards[i].collections, function (collection) {
        for (var j in byShard[shards[i]._id]) {
          if (byShard[shards[i]._id][j].ns == collection.name) {
            collection.chunks.push(byShard[shards[i]._id][j]);
            numchunks++;
          }
        }
      });
      shards[i].numchunks = numchunks;
    }
    return shards;
  }

  function drawCollections( data ){
    var formattedData;
    if( source == "db" ) formattedData = formatCollectionsData( dbData.collections , 
                                                                dbData.shards ,
                                                                dbData.chunks );

    if( source == "replay" ) formattedData = formatCollectionsData( replayData.collections , 
                                                                    replayData.shards , 
                                                                    replayData.chunks );

    if( formattedData.children.length != 0 )
      colls( formattedData );
  }

  function drawShards( data ){
    var formattedData;
    if( source == "db" ) formattedData = formatShardsData( dbData.collections , 
                                                           dbData.shards , 
                                                           dbData.chunks );
      
    if( source == "replay" ) formattedData = formatShardsData( replayData.collections ,
                                                               replayData.shards ,
                                                               replayData.chunks );

    console.log(formattedData);
    if( formattedData.length != 0 )
      shrds( formattedData );
  }

  function init( cntr ){
    if( typeof cntr == "undefined" ) return;
    container = cntr;
    source = "db" ; // Defaults to db
    colls = collections( container );
    shrds = shardChart( container );  
  }


  function setSource( src ){
    if( typeof src == "undefined" || typeof src != "string" ) return;
    if( src != "db" && src != "replay" ) return;
    source = src;
  }

  function setData( data ){
    if( typeof data == "undefined" ) return;
    if( source == "db" ) dbData = data;
    if( source == "replay" ) replayData = data; 
  }

  function processData( mode ){
    if( typeof mode == "undefined" || typeof mode != "string" ) return;
    switch(mode) {
      case "collections" : {
        drawCollections();
      }
      break;
      case "shards" : {
        drawShards();
      }
      break;
    }
  }

  // Public methods

  return {
    init : init,
    setData : setData,
    setSource : setSource ,
    processData : processData
  }

})();
