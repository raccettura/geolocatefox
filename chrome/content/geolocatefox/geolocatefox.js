/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is GeoLocateFox.
 *
 * The Initial Developer of the Original Code is
 *   Robert Accettura <robert@accettura.com>
 *
 * Portions created by the Initial Developer are Copyright (C) 2006
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

/****************
 * A note to readers
 ****************
 * Currently this extension only supports Yahoo! Maps.
 * The intent is to support multiple mapping providers
 * including Google, but to date only Yahoo! has a terms
 * of use that allow for non-webapplication use.  Google
 * explicity prohibits such use right now:
 * http://www.google.com/apis/maps/faq.html#faq6
 * they were contacted by me in mid December about this
 * extension, but to date have not replied with permission
 * to include their service.  While it may in theory be ok
 * to do considering Firefox is a web browser, and we are
 * not doing anything harmful, I don't wish to get into any
 * trouble, it's their API, and I respect that.
 *
 * Hopefully I'll get an email from *@google.com saying they
 * would love for me to include them.
 *
 * Of course if anyone reading this works for Google Inc. and
 * would facilitate such an action, please do so.
 *
 * Btw: I'm for hire in May 2006.  If you find this creative,
 * or feel there is potential here.  Contact me with job offers.
 * or just loads of cash ;-).
 *
 * Ok, enough rambling... to the code.
 **/

// Global Latitude and Longitude
var geolocatefox_latitude = null;
var geolocatefox_longitude = null;

// Bool to check if we loaded the map
var geolocatefox_mapDisplayLoaded = false;

// These are the meta tags we current accept
var geolocatefox_validMeta = new Array("icbm", "geo.position", "geo.placename");

// These are different ways of delimiting the lat and long or placename contents
var geolocatefox_delimiter = new Array(",",";");

var geolocatefox_util = new GeoLocateFoxUtil();

/**
 * Reads the current page, and gets the coordinates should they exist
 * and saves them to latitude and longitude for future use.
 **/
function geolocatefox_getCoords()
{
  // clear them when we re-init
  geolocatefox_latitude = null;
  geolocatefox_longitude = null;
  geolocatefox_mapDisplayLoaded = false;

  // Try first for embedded coords
  if(!geolocatefox_getEmbeddedCoords()){
    // If no good, try to get IP coordinates
    if(geolocatefox_util.getBoolPref("useHostIP", DEFAULT_USE_HOSTIP)){
      if(!geolocatefox_getIpCoords()){
        // Clear source for now, since we don't have one
        geolocatefox_source = null;
        return false;
      }
    }
  }
  return true;
}

function geolocatefox_getEmbeddedCoords()
{
  var metaArray = window.content.document.getElementsByTagName("meta");
  for(var i=0; i<metaArray.length; i++)
  {
    var name = metaArray[i].getAttribute("name");
    if(name != null)
    {
      name = name.toString();
      name = name.toLowerCase();
      for(var j=0; j<geolocatefox_validMeta.length; j++)
      {
        if(name == geolocatefox_validMeta[j])
        {
          val = metaArray[i].getAttribute("content");
          bestDel = _geolocatefox_getDelimiter(val);

          if(bestDel != -1)
          {
            // for icbm and geo.position we do this (0 and 1 on the array)
            if(j<=1)
            {
              // where to hold it once we split it
              var latlong = new Array();
              // split
              latlong = val.split(geolocatefox_delimiter[bestDel]);
              geolocatefox_latitude = _geolocatefox_trim(latlong[0]);
              geolocatefox_longitude = _geolocatefox_trim(latlong[1]);
              // only do oncoords if we have vals
              if(geolocatefox_latitude != null && geolocatefox_longitude != null)
              {
                _geolocatefox_coords(true);
                geolocatefox_source = 'meta';
                return true;
              }
            }
            // for geo.placename (2 on array) we need to geocode first
            else if(j == 2)
            {
              var citycountry = new Array();
              citycountry = val.split(geolocatefox_delimiter[bestDel]);
              var city = _geolocatefox_trim(citycountry[0]);
              var country = _geolocatefox_trim(citycountry[1]);
              _geolocatefox_useGeocode(city, country);
              // only do oncoords if we have vals
              if(geolocatefox_latitude != null && geolocatefox_longitude != null)
              {
                _geolocatefox_coords(true);
                geolocatefox_source = 'meta';
                return true;
              }
            }
          }
        }
      }
    }
  }
  _geolocatefox_coords(false);
  return false;
}

/**
 * Figure out what delimeter we should use for val
 * @param aStr The string to analyze
 **/
function _geolocatefox_getDelimiter(aStr){
  var currentDelimiterVal = -1;
  var bestDel = -1;
  for(var k=0; k<geolocatefox_delimiter.length; k++)
  {
    currentDelimiterVal = aStr.indexOf(geolocatefox_delimiter[k]);
    if(currentDelimiterVal != -1)
    {
      bestDel = k;
      break;
    }
  }
  return bestDel;
}

/**
 * If we don't have geocoded url, lets try looking up the IP address and see if that finds anything.
 **/

function geolocatefox_getIpCoords()
{
 var hostname =  Components.classes["@mozilla.org/network/io-service;1"]
                       .getService(Components.interfaces.nsIIOService)
                       .newURI(getBrowser().currentURI.spec, null, null).host;

  var dnsService = Components.classes['@mozilla.org/network/dns-service;1'].getService(Components.interfaces.nsIDNSService)
  var dnsRecord = dnsService.resolve(hostname, 0);
  var ip = dnsRecord.getNextAddrAsString();

  var url = "http://api.hostip.info/?ip=" + ip;
  var responseText = _geolocatefox_makeXMLHttpRequest(url);

  this.parser = new DOMParser();
  var xml = this.parser.parseFromString(responseText, "text/xml").documentElement;

  var latlong = null; // init to null
  latlong = xml.getElementsByTagName("coordinates")[0].firstChild.nodeValue;

  if(!latlong){
    _geolocatefox_coords(false);
    return false;
  }

  latlong = latlong.split(',');
  geolocatefox_latitude = _geolocatefox_trim(latlong[1]);
  geolocatefox_longitude = _geolocatefox_trim(latlong[0]);
  _geolocatefox_coords(true);
  geolocatefox_source = 'ip';
  dns = null;

  return true;
}



/**
 * For something like geo.placename which gives us the city and country, we
 * geocode to get the coordinates.  This involves everyone's favorite buzz word "AJAX".
 * Just for putting "AJAX" in my source code, I think I increased my net-worth by about a billion
 * dollars.
 * @param aCity The city as a string, though seems to take state fairly well
 * @param aCountry The country as a string
 **/
function _geolocatefox_useGeocode(aCity, aCountry)
{
  var url = "http://api.local.yahoo.com/MapsService/V1/geocode?appid="+YAHOO_APP_ID+"&city="+escape(aCity)+"&country="+escape(aCountry);
  var responseText = _geolocatefox_makeXMLHttpRequest(url);
  this.parser = new DOMParser();
  var xml = this.parser.parseFromString(responseText, "text/xml").documentElement;
  geolocatefox_latitude = xml.getElementsByTagName("Latitude")[0].firstChild.nodeValue;
  geolocatefox_longitude = xml.getElementsByTagName("Longitude")[0].firstChild.nodeValue;
  return;
}

/**
 * This is the actual ajax code.  Oops, I said it again, myNetWorth += 100000000000;
 * it returnsthe responseText
 * @param aURL the url to request (GET ONLY)
 **/
function _geolocatefox_makeXMLHttpRequest(aURL)
{
  // this is essentially just a really basic ajax deal, with no forking for IE.  Bliss.
  var http_request = new XMLHttpRequest();
  http_request.open("GET", aURL, false);
  http_request.send(null);
  return http_request.responseText;
}

/**
 * Sends coordinates to actual map.
 **/
function geolocatefox_setCoordsDisplayMap()
{
  /**
   * If we already did this (and hasn't been reset), no need
   * to redo the work.
   **/
  if (geolocatefox_mapDisplayLoaded)
  {
    return true;
  }
  var box = document.getElementById("geolocatefoxtooltipvbox");
  var replacementElement = document.getElementById("mapArea");
  var mapText = document.getElementById("mapText");
  var mapDblClk = document.getElementById("geolocatefox-dblClickNote");

  // Figure out what mapping service to use:
  var mapService = geolocatefox_util.getCharPref("mapService", DEFAULT_MAP_SERVICE)

  var strbundle=document.getElementById("strings");

  if(geolocatefox_latitude != null && geolocatefox_longitude != null)
  {
    // now create the iframe map
    var mapframe = document.createElement("iframe");
    mapframe.setAttribute("id", "mapArea");

    // Make it view the map
    mapframe.setAttribute("src", "chrome://geolocatefox/content/map.html?"+mapService+","
                                   +geolocatefox_latitude+","+geolocatefox_longitude);

    // Set the width, height, class
    mapframe.setAttribute("minwidth", geolocatefox_util.getCharPref("mapTooltipWidth", DEFAULT_TOOLTIP_MAP_WIDTH));
    mapframe.setAttribute("minheight", geolocatefox_util.getCharPref("mapTooltipHeight", DEFAULT_TOOLTIP_MAP_HEIGHT));

    // Other attributes
    mapframe.setAttribute("type", "content");
    mapframe.setAttribute("flex", "1");

    // Text above
    var mapTextVal;
    if(geolocatefox_source == 'ip'){
      mapTextVal = strbundle.getString("serverIpLocation")+' ';
    } else {
      mapTextVal = strbundle.getString("location")+' ';
    }

    mapTextVal += geolocatefox_latitude+", "+geolocatefox_longitude;

    mapText.setAttribute("value", mapTextVal);
    mapText.setAttribute("class", "latlong");

    // Texst Below
    mapDblClk.setAttribute("value", strbundle.getString("dblClickNote"));
  }
  else
  {

    // This is essentially a dummy element.
    var mapframe = document.createElement("description");
    mapframe.setAttribute("id", "mapArea");

    //  Just let the user know no geolocation data is available
    mapText.setAttribute("value", strbundle.getString("noGeoLocationData"));
    mapText.setAttribute("class", "");

    // Blank
    mapDblClk.setAttribute("value", "");
  }

  // Do actual replacement
  box.replaceChild(mapframe, replacementElement);

  geolocatefox_mapDisplayLoaded = true;
  return true;
}

/**
 * Change the status icon to reflect if a geolocation is found
 * @param aStatus bool true on/false off
 **/
function _geolocatefox_changeIcon(aStatus){
  var icon = document.getElementById("geolocatefox-statusicon");
  if(aStatus)
  {
    icon.setAttribute("src", "chrome://geolocatefox/skin/img/icon-on.png");
  }
  else
  {
    icon.setAttribute("src", "chrome://geolocatefox/skin/img/icon-off.png");
  }
  return;
}

/**
 * Changes status icon, map, and resets latitude, longitude as necessary if
 * if results are found (or not) as appropriate.
 * @param aStatus bool true on/false off
 **/
function _geolocatefox_coords(aStatus)
{
  if(aStatus)
  {
    _geolocatefox_changeIcon(true);
  }
  else
  {
    // set globals to null (invalid);
    geolocatefox_latitude = null;
    geolocatefox_longitude = null;
    _geolocatefox_changeIcon(false);

  }
  /**
   * Right now we execute this when we show the popup, because it uses less
   * bandwidth.  The downside is that it's slower.  By doing it here, it would
   * hit the server regardless (more load for mapping provider, and wasted bandwidth
   * for users), but would be more fluent and instant.
   * This is really one thing that's a loose loose situation in this case.  We have no
   * perfect way of solving this problem.
   **/
  if(geolocatefox_util.getBoolPref("preLoad", DEFAULT_PRE_LOAD))
  {
    geolocatefox_setCoordsDisplayMap();
  }
  return;
}

/**
 * Load the map when shown for first time
 **/
function geolocatefox_onMapShowing(){
  if(!geolocatefox_util.getBoolPref("preLoad", DEFAULT_PRE_LOAD))
  {
    geolocatefox_setCoordsDisplayMap();
  }
}

/**
 * Opens up big map in new browser window.
 **/
function geolocatefox_onIconClick()
{
  var mapService = geolocatefox_util.getCharPref("mapService", DEFAULT_MAP_SERVICE);
  var mapURL;
  /* YAHOO */
  if(mapService == 'yahoo')
  {
    if(geolocatefox_latitude == null && geolocatefox_longitude == null)
    {
      // just go to Yahoo home page if there is no location
      mapURL = "http://maps.yahoo.com/";
    }
    else
    {
      mapURL = "http://maps.yahoo.com/beta/#mvt=h&maxp=search&trf=0&lon="+geolocatefox_longitude+
                 "&lat="+geolocatefox_latitude+"&mag="+DEFAULT_Y_MAP_CLICK_MAG;
    }
  }
  geolocatefox_util.openURL(mapURL);
  return;
}

/**
 * Trims whitespace from a string
 * @param aStr the string to trim
 **/
function _geolocatefox_trim(str)
{
  // why doesn't js do this on their own?  It's such a simple thing, and so useful.
  return str.replace(/^\s*/, '').replace(/\s*$/, '');
}