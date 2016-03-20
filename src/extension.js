/* -*- Mode: js2; indent-tabs-mode: t; c-basic-offset: 4; tab-width: 4 -*-  */
/*
 * extension.js
 * Copyright (C) 2016 Jan Trejbal <jan.trejbal@gmail.com>
 * 
 * Docker integration is free software: you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by the
 * Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * Docker integration is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU General Public License for more details.
 * \
 * You should have received a copy of the GNU General Public License along
 * with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
const Gtk = imports.gi.versions.Gtk = '3.0';

const Config = imports.misc.config;
const Lang = imports.lang;

const Main = imports.ui.main;

const St = imports.gi.St;
const NetworkManager = imports.gi.NetworkManager;
const Mainloop = imports.mainloop;

// Other javascript files in the docker-integration@jan.trejbal.gmail.com directory are accesible via Extension.<file name>
const Extension = imports.misc.extensionUtils.getCurrentExtension();

//const Menu = Extension.imports.menu;
//const Panel = Extension.imports.panel;
//const Settings = Extension.imports.settings;

//const Gettext = imports.gettext; 
//const _ = Gettext.gettext;

let extensionName = Extension.dir.get_basename();
let matchRegExp = /^Ethernet \(veth[a-z0-9]+\)$/i;

const DockerNetworkManager = new Lang.Class({
	Name : 'DockerNetworkManager',
	
	_init : function() {
		this._nAttempts = 0;
		this._ethDevices = {};
		this._checkDevices();
	},

	_checkDevices : function() {
		if(this._timeoutId){
			Mainloop.source_remove(this._timeoutId);
			this._timeoutId = null;
		}
		
		let _network = Main.panel.statusArea.aggregateMenu._network;
		if (_network) {
			if (!_network._client || !_network._settings) {
				// Shell not initialised completely wait for max of
				// 100 * 1 sec
				if (this._nAttempts++ < 100) {
					this._timeoutId = Mainloop.timeout_add(1000, Lang.bind(this, this._checkDevices));
				}
			}
			else {
				let _devices = _network._devices.wired.devices;

				for ( var i = 0; i < _devices.length; i++) {
					this._deviceAdded(_devices[i]._getDescription(), _devices[i]);
				}
			}
		}
	},

	_deviceAdded : function(deviceDescription, device) {
		if ( !matchRegExp.test(deviceDescription)) {
			return;
		}
		
		let _this = this;
		this._ethDevices[deviceDescription] = new Object();
		if(this._ethDevices[deviceDescription].timeoutId){
			Mainloop.source_remove(this._ethDevices[deviceDescription].timeoutId);
			this._ethDevices[deviceDescription].timeoutId = null;
		}

		log(extensionName + ' hide: ' + deviceDescription);
		device.item.actor.visible = false;
		this._ethDevices[deviceDescription].device = device;
	},

	_deviceRemoved : function(deviceDescription, device) {
		log(extensionName + ' show: ' + deviceDescription);
		device.item.actor.visible = true;
		delete this._ethDevices[deviceDescription];
	},

	destroy : function() {
		for ( var deviceDescription in this._ethDevices) {
			if (this._ethDevices.hasOwnProperty(deviceDescription)) {
				this._deviceRemoved(deviceDescription, this._ethDevices[deviceDescription].device);
			}
		}
	}
});

let _instance;
function enable() {
	_instance = new DockerNetworkManager();
}

function disable() {
	_instance.destroy();
	_instance = null;
}
