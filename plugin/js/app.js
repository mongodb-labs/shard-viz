// app.js

$(document).ready(function(){

  host = ['127.0.0.1', '5004', '', ''];

  var timeoutInterval = 500;
  var configAt;
  var destDate;
  var chunks;
  var collectionsOrig;
  var shards;
  var changeLog;
  var timerId;

  Controller.init( d3.select("#drawboard") );
  initPlayer();
  initSlider();

  $("#slider").on( "slidestart", function( event , ui ){
    pause();
    curSliderVal = ui.value;
  });

  $("#slider").on( "slidestop" , function( event , ui ){

    if( ui.value != curSliderVal ){

      if( typeof configAt == "undefined")
        configAt = changeLog[changeLog.length-1].time.$date;
      else configAt = destDate;
      destDate = changeLog[ui.value].time.$date;

      var collections = [];
      _.each( collectionsOrig , function(coll){ collections.push( new clone(coll) ); });

      updateColls( host , collectionsOrig , collections , configAt , destDate , function(err) {

        if( !err ){

          lockSlider();
          
          var chunkMap = {};
          _.each(chunks , function(chunk){
            chunkMap[Replay.genChunkKey( chunk.ns , chunk.min )] = new clone(chunk);
          });


          var preTime = new Date().valueOf();

          var data = Replay.replay( collections , 
                                    shards , 
                                    chunkMap, 
                                    configAt , 
                                    changeLog , 
                                    destDate );   

          var postTime = new Date().valueOf();

          chunks = data.chunks;
          collections = data.collections;
          shards = data.shards;

          Controller.setSource( "replay" );
          Controller.setData( data );
          Controller.processData( "collections" ); 

          unlockSlider();
        }
      });
    } 
  });

  // Replay player logic 

  $( "#play" ).button({
    text: false,
    icons: {
      primary: "ui-icon-pause"
    }
  }).click(function() {
      if ( $( this ).text() === "play" ) {
        play();
      } else {
        pause();
      }
    });

  function initPlayer(){
    timerId = renderFromDB( timeoutInterval );
    var options = {
      label: "pause",
      icons: {
        primary: "ui-icon-pause"
      }
    };
    $( "#play" ).button( "option", options );
  }

  function play(){
    if( $( "#play" ).text() === "play" ){
      timerId = renderFromDB( timeoutInterval );
      var options = {
        label: "pause",
        icons: {
          primary: "ui-icon-pause"
        }
      };
      $( "#play" ).button( "option", options );
    }
  }

  function pause(){
    if( $( "#play" ).text() === "pause" ){
      clearInterval(timerId);
      var options = {
        label: "play",
        icons: {
          primary: "ui-icon-play  "
        }
      };
      $( "#play" ).button( "option", options );
    }
  }

  // Query db and render retrieved data

  function renderFromDB( interval ){
    return setInterval(function () {
      getCollections(host, function(collections_from_db) {
        getShards(host, function(shards_from_db) {
          getChunks(host, function( chunks_from_db ) {
            getChangelog( host , function( changelog_from_db ){

              changeLog = changelog_from_db.rows;

              updateSlider( changelog_from_db.rows.length-1 , changelog_from_db.rows.length-1); 

              chunks = chunks_from_db.rows;
              shards = shards_from_db.rows;
              collectionsOrig = collections_from_db.rows;

              var data = { collections : collectionsOrig , 
                           shards : shards , 
                           chunks : chunks };

              Controller.setSource( "db" );
              Controller.setData( data );
              Controller.processData( "collections" );

            });
          });
        });
      });
    }, interval );
  }
 
});

// Slider functions

function initSlider(){
  $( "#slider" ).slider({
    max : 100,
    value : 100
  });
}

function lockSlider(){
  if( ! $( "#slider" ).slider( "option", "disabled" ) )
    $( "#slider" ).slider( "option", "disabled", true );
}

function unlockSlider(){
  if( $( "#slider" ).slider( "option", "disabled" ) )
    $( "#slider" ).slider( "option", "disabled", false );
}

function updateSlider( value , max ){
  $( "#slider" ).slider({
    max : max ,
    value : value
  });
}

// Check which collections need to be rendered on a particular replay operation. 

function updateColls( host , collections , collsForUse , configAt , destDate , next ){

  var direction = destDate - configAt > 0 ? "forward" : "rewind" ; 

  var processQuery = function( query , ns , cb ){
    if( direction == "rewind" ){
      if( query.rows[0].time.$date >= destDate ){
        for( var i in collsForUse ){
          if( collsForUse[i]._id == ns)
            collsForUse.splice(i, 1);
        }
      }
    } else {
      if( query.rows[0].time.$date > destDate ){
        for( var i in collsForUse ){
          if( collsForUse[i]._id == ns)
            collsForUse.splice(i, 1);
        }
      }
    }
    cb();
  }

  var findInitColl = function( arg , cb ){
    getInitCollEvent( host , arg._id , function(query){ processQuery( query , arg._id , cb ); } );
  }

  async.forEach( collections , findInitColl , next );
}

// vim: set et sw=2 ts=2;
