$(document).ready(function(){

  host = ['127.0.0.1', '5004', '', ''];
  Controller.init( d3.select("#drawboard") );

  var timerId = renderFromDB();
  var configAt;
  var destDate;
  var interval = 500;
  var chunks;
  var collectionsOrig;
  var shards;
  var changeLog;

  getChangelog( host , function(changelog_from_db){
    changeLog = changelog_from_db.rows;
    $( "#slider" ).slider({
      max : changeLog.length-1,
      value : changeLog.length-1
    });
  });
  
  $("#slider").on( "slidestart", function( event , ui ){
    curSliderVal = ui.value;
  });

  $("#slider").on( "slidestop" , function( event , ui ){
    clearInterval( timerId );
    if( ui.value != curSliderVal ){

      if( typeof configAt == "undefined")
        configAt = changeLog[changeLog.length-1].time.$date;
      else configAt = destDate;
      destDate = changeLog[ui.value].time.$date;

      var collections = [];
      _.each( collectionsOrig , function(coll){ collections.push( new clone(coll) ); });

      updateColls( host , collections , configAt , destDate , function(err) {

        if( !err ){
        
          if( ! $( "#slider" ).slider( "option", "disabled" ) )
            $( "#slider" ).slider( "option", "disabled", true );

          var chunkMap = {};
          _.each(chunks , function(chunk){
            chunkMap[Replay.genChunkKey( chunk.ns , chunk.min )] = new clone(chunk);
          });

          var data = Replay.replay( collections , 
                                    shards , 
                                    chunkMap, 
                                    configAt , 
                                    changeLog , 
                                    destDate );   
          chunks = data.chunks;
          Controller.setSource( "replay" );
          Controller.setData( data );
          Controller.processData( "collections" ); 
          $( "#slider" ).slider( "option", "disabled", false );
          console.log(collections);
        }
      });
    } 
  });

  function renderFromDB(){
    return setInterval(function () {
      getCollections(host, function(collections_from_db) {
        getShards(host, function(shards_from_db) {
          getChunks(host, function( chunks_from_db ) {
            // getChangelog( host , function( changelog_from_db ){

              chunks = chunks_from_db.rows;
              shards = shards_from_db.rows;
              collectionsOrig = collections_from_db.rows;

              var data = { collections : collectionsOrig , 
                           shards : shards , 
                           chunks : chunks };
  
              Controller.setSource( "db" );
              Controller.setData( data );
              Controller.processData( "collections" );
    
            // });
          });
        });
      });
    }, 500);
  }

});

function updateColls( host , collections , configAt , destDate , next ){

  var direction = destDate - configAt > 0 ? "forward" : "rewind" ; 

  var processQuery = function( query , ns , cb ){
    if( direction == "rewind" ){
      if( query.rows[0].time.$date >= destDate ){
        for( var i in collections ){
          if( collections[i]._id == ns)
            collections.splice(i, 1);
        }
      }
    } else {
      if( query.rows[0].time.$date > destDate ){
        console.log("here")
        for( var i in collections ){
          if( collections[i]._id == ns)
            console.log(collections.splice(i, 1));
        }
      }
    }
    cb();
  }

  var findInitColl = function( arg , cb ){
    getInitCollEvent( host , arg._id , function(query){ processQuery(query , arg._id , cb ); } );
  }

  async.forEach( collections , findInitColl , next );

}

// vim: set et sw=2 ts=2;
