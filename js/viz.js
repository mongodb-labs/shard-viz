$.base64.is_unicode = true;

function queryDB(commandUrl, username, password, success, failure, cmdError, notFound, serverError) {
    var xhr = new XMLHttpRequest();
    if (username && username != null && username != '') {
	xhr.open("GET", commandUrl, true, username, $.base64.decode(password));
    } else { 
	xhr.open("GET", commandUrl, true);
    }

    xhr.onreadystatechange = function() {
	if (xhr.readyState == 4 && xhr.status == 200) {
	    authProblem = false;
	    $('#statusMsgContainer').hide();

	    var resp = JSON.parse(fixDateFields(xhr.responseText));

	    // TODO: Check for mongo error state in response json

	    success(resp);
	} else if (xhr.readyState == 4 && xhr.status == 404) {
	    if (notFound) notFound();

	} else if (xhr.readyState == 4 && xhr.status == 0) {
	    // The client is not able to connect to the server. Display error message.
	    $('#statusMsgContainer').html('Unable to connect to server: ' + commandUrl);
	    $('#statusMsgContainer').show();

	} else if (xhr.readyState == 4 && xhr.status != 200) {
	    if (serverError) serverError(xhr.readyState, xhr.status);
	    if (failure) failure(xhr.readyState, xhr.status);
	} 
    }
    xhr.send();
};

function getChunks(host, success, failure, cmdError, notFound, serverError) {
    queryDB(('http://' + host[0] + ':' + host[1] + '/config/chunks/'), host[2], host[3], success, failure, cmdError, notFound, serverError);
};

function getNumChunks(host, success, failure, cmdError, notFound, serverError) {
    queryDB(('http://' + host[0] + ':' + host[1] + '/config/$cmd/?filter_count=chunks&limit=1'), host[2], host[3], success, failure, cmdError, notFound, serverError);
};

function getShards(host, success, failure, cmdError, notFound, serverError) {
    queryDB(('http://' + host[0] + ':' + host[1] + '/config/shards/'), host[2], host[3], success, failure, cmdError, notFound, serverError);
};

function getNumShards(host, success, failure, cmdError, notFound, serverError) {
    queryDB(('http://' + host[0] + ':' + host[1] + '/config/$cmd/?filter_count=shards&limit=1'), host[2], host[3], success, failure, cmdError, notFound, serverError);
};

function getSettings(host, success, failure, cmdError, notFound, serverError) {
    queryDB(('http://' + host[0] + ':' + host[1] + '/config/setttings/'), host[2], host[3], success, failure, cmdError, notFound, serverError);
};

function getChangelog(host, success, failure, cmdError, notFound, serverError) {
    queryDB(('http://' + host[0] + ':' + host[1] + '/config/changelog/'), host[2], host[3], success, failure, cmdError, notFound, serverError);
};

/**
 * There is a date format bug in some older versions of Mongo. Thanks to Lucas for 
 * submitting part of the regex solution :-)
 *
 * The regex below replaces the date fields with 0 (since they are not used).
 *
 * http://jira.mongodb.org/browse/SERVER-2378
 * 
 * The old format is:
 * "last_finished" : Date( 1295450058854 ) 
 * The date format in newer releases is:
 * "localTime" : { "$date" : 1295452287356 }
 */
function fixDateFields(resp) { return resp.replace(/Date\( (\d+) \)/g, "0"); };

function isInt(v) {
    var regex = /(^-?\d\d*$)/;
    return regex.test(v);
};

/**
 * Parse the host id.
 */
function parseHostId(hostId) { return hostId.split(":"); };

/**
 * Assemble the host id.
 */
function assembleHostId(host) { return baseAssembleHostId(host[0], host[1]); };

/**
 * Assemble the host based on hostname and port.
 */
function baseAssembleHostId(hostname, port) { return hostname + ':' + port; };

/**
 * Load the persisted hosts. Load the data from local storage and create the table (if missing).
 */
function loadHosts() {
    var hosts = getPersistedItem('hosts');
    if (!hosts) {
	hosts = [ [ '127.0.0.1', '28017', '', '' ] ]
	persistItem('hosts', hosts);
    }
    return hosts;
};

function findHost(hostId) {
    var hosts = loadHosts();

    for (var idx in hosts) {
	var host = hosts[idx];
	var hid = assembleHostId(host);
	if (hostId == hid) return host;
    }

    return null;
};

function getPersistedItem(key) {
    var value;
    try { 
	value = window.localStorage.getItem(key);
    } catch(e) { 
	value = null; 
    }
    if (value) return JSON.parse(value);
    return null;
};

function persistItem(key, value) {
    window.localStorage.setItem(key, JSON.stringify(value));
};
