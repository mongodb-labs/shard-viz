// checkpoint.js

var Checkpoint = (function(){

	var map = {};

	function saveItem( key , value ){
		map[key] = value;
	}

	function removeItem( key ){
		delete map[key];
	}

	function getItem( key ){
		return map[key];
	}

	return {
		save : saveItem ,
		remove : removeItem , 
		get : getItem 
	}

})();