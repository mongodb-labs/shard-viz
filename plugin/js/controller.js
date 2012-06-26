var Controller = (function(){

	// Private variables

	var dbData = [];
	var replayData = [];


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

	function drawCollections( data ){
		var formattedData;
		if( this.source == "db" ) formattedData = formatCollectionsData(dbData);
		if( this.source == "replay") formattedData = formatCollectionsData(replaydata);
		collections.PhillipsMethod( this.container , formattedData );
	}

	function init( container ){
		if( typeof mode == "undefined" || typeof mode != "string" ) return;
		controller.container = $(container);
		controller.source = "db" ;
	}


	function setSource( source ){
		if( typeof source == "undefined" || typeof source != "string" ) return;
		if( source != "db" && source != "replay" ) return;
		this.source = source;
	}

	function setData( data ){
		if( typeof data == "undefined" ) return;
		if( this.source == "db" ) dbData = data;
		if( this.source == "replay" ) replayData = data; 
	}

	function processData( mode , data ){
		if( typeof mode == "undefined" || typeof mode != "string" ) return;
		switch(mode) {
			case "collections" : {
				drawCollections( data );
			}
			case "shards" : {

			}
		}
	}

	// Public methods

	return {
		init : init,
		processData : processData
	}

})();





















