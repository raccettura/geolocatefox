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

var geolocatefox_util = new GeoLocateFoxUtil();

// Get mapService, lat/long
var urlquery=location.href.split("?")
var urlterms=urlquery[1].split(",")
var mapService = urlterms[0];

var latitude = urlterms[1];
var longitude = urlterms[2];

var width = geolocatefox_util.getCharPref("toolTipMapWidth", 
                                DEFAULT_TOOLTIP_MAP_WIDTH);
var height = geolocatefox_util.getCharPref("toolTipMapHeight",
                                 DEFAULT_TOOLTIP_MAP_HEIGHT);

var mapContainer = document.getElementById('mapContainer');

// Set Height and width for the container element
mapContainer.style.height = height;
mapContainer.style.width = width;

/*************************
 *         YAHOO
 *************************/
if(mapService == 'yahoo'){

  // Create a lat/lon object
  var myPoint = new YGeoPoint(latitude, longitude);

  // Create a map object
  var map = new YMap(mapContainer, YAHOO_MAP_HYB, YSize(width, height));

  // Disable The Clutter
  map.disableDragMap();
  map.removePanControl();
  map.removeZoomControl();

  // Display the map centered on a latitude and longitude
  map.drawZoomAndCenter(myPoint, 15);

  var myImage = new YImage();
  myImage.src = 'chrome://geolocatefox/skin/img/pointer.png';
  myImage.size = new YSize(15,15);
  myImage.offsetSmartWindow = new YCoordPoint(0,0);

  // Create a marker positioned at a lat/lon
  var marker = new YMarker(myPoint, myImage);

  // Display the marker
  map.addOverlay(marker);
}
/*************************
 *        GOOGLE
 *************************/
if(mapService == 'google'){
  /* According to the Google TOS, you can only use their
     mapping api for webapps, not for anything client side.
     I asked for permission back in mid Dec, but never heard
     any reply, so until that happens, I can't support it.  Though
     it would be nice, since it supports non-US locations.

     If/when Google blesses this project, we can simply slip the google
     specific code in here, making it rather easy.  Just need to remember
     to update the onClick stuff in geolocatefox.js
  */
}
