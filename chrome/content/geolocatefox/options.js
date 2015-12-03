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
 *     Robert Accettura <robert@accettura.com>.
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

var gGeoLocateFoxUtil = new GeoLocateFoxUtil();

function GeoLocateFoxOptions() {}
GeoLocateFoxOptions.prototype = {

  /**
   * Loads preferences and populates options dialog
   **/
  loadPrefsDialog: function()
  {
    document.getElementById('mapService').value =          gGeoLocateFoxUtil.getCharPref("mapService", DEFAULT_MAP_SERVICE);
    document.getElementById('preLoad').checked =           gGeoLocateFoxUtil.getBoolPref("preLoad", DEFAULT_PRE_LOAD);
    document.getElementById('toolTipMapWidth').value =     gGeoLocateFoxUtil.getCharPref("toolTipMapWidth", DEFAULT_TOOLTIP_MAP_WIDTH);
    document.getElementById('toolTipMapHeight').value =    gGeoLocateFoxUtil.getCharPref("toolTipMapHeight", DEFAULT_TOOLTIP_MAP_HEIGHT);
    document.getElementById('useHostIP').checked =          gGeoLocateFoxUtil.getBoolPref("useHostIP", DEFAULT_USE_HOSTIP);

    return true;
  },

  /**
   * Gets prefs from dialog and saves to prefs.
   **/
  savePrefsDialog: function()
  {
    var mapService = document.getElementById('mapService').value;
    gGeoLocateFoxUtil.setCharPref('mapService', mapService);

    var preLoad = document.getElementById('preLoad').checked;
    gGeoLocateFoxUtil.setBoolPref('preLoad', preLoad);

    var toolTipMapWidth = document.getElementById('toolTipMapWidth').value;
    gGeoLocateFoxUtil.setCharPref('toolTipMapWidth', toolTipMapWidth);

    var toolTipMapHeight = document.getElementById('toolTipMapHeight').value;
    gGeoLocateFoxUtil.setCharPref('toolTipMapHeight', toolTipMapHeight);

    var useHostIP = document.getElementById('useHostIP').checked;
    gGeoLocateFoxUtil.setBoolPref('useHostIP', useHostIP);

    return true;
  },

  /**
   * Restores default values to dialog
   **/
  defaults: function()
  {
    document.getElementById('mapService').value =            DEFAULT_MAP_SERVICE;
    document.getElementById('preLoad').checked =             DEFAULT_PRE_LOAD;
    document.getElementById('toolTipMapWidth').value =       DEFAULT_TOOLTIP_MAP_WIDTH;
    document.getElementById('toolTipMapHeight').value =      DEFAULT_TOOLTIP_MAP_HEIGHT;
    document.getElementById('useHostIP').value =             DEFAULT_USE_HOSTIP;

    return true;
  }
};