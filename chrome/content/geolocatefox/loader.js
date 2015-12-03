const STATE_START = Components.interfaces.nsIWebProgressListener.STATE_START;
const STATE_STOP = Components.interfaces.nsIWebProgressListener.STATE_STOP;

var gIsNewLoad = false;
var gTimerID;
var geoLocateFoxListener =
{
  QueryInterface: function(aIID)
  {
   if (aIID.equals(Components.interfaces.nsIWebProgressListener) ||
       aIID.equals(Components.interfaces.nsISupportsWeakReference) ||
       aIID.equals(Components.interfaces.nsISupports))
     return this;
   throw Components.results.NS_NOINTERFACE;
  },

  onStateChange: function(aProgress, aRequest, aFlag, aStatus){
   if (aFlag & STATE_START)
   {
     gIsNewLoad = true;
   }
   if (aFlag & STATE_STOP)
   {
        gIsNewLoad = false;
        clearInterval(gTimerID);
   }

  },

  onLocationChange: function(aProgress, aRequest, aURI)
  {
    // Check if it's a valid protocol.  This helps us avoid queries on about:blank
    var validScheme = false;
    switch (getBrowser().currentURI.scheme) {
      case "http":
      case "https":
      case "ftp":
      case "gopher":
        validScheme = true;
    }

    if(!validScheme){
      return 0;
    }

    // This fires when the location bar changes i.e load event is confirmed
    // or when the user switches tabs
    // we start with nocoords, so while the page is loading it stays greyed out
    if(!gIsNewLoad)
    {
      geolocatefox_getCoords();
    }
    else
    {
      var appcontent = document.getElementById("appcontent");   // browser

      if(appcontent){
        appcontent.addEventListener("load", geolocatefox_getCoords, true);
      }
    }
    return 0;
  },

  // For definitions of the remaining functions see XulPlanet.com
  onProgressChange: function() {return 0;},
  onStatusChange: function() {return 0;},
  onSecurityChange: function() {return 0;},
  onLinkIconAvailable: function() {return 0;}
}

window.addEventListener("load", function() { startGeoLocateFoxListener(); }, false);


function startGeoLocateFoxListener()
{
  gBrowser.addProgressListener(geoLocateFoxListener,
    Components.interfaces.nsIWebProgress.NOTIFY_STATE_DOCUMENT);
}