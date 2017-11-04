const Gtk = imports.gi.versions.Gtk = '3.0';

const Lang = imports.lang;
const Mainloop = imports.mainloop;

const Main = imports.ui.main;

const DockerNetworkManager = new Lang.Class({
	Name : 'DockerNetworkManager',

	_init : function(extensionName, matchRegExp) {
		this._extensionName = extensionName;
		this._matchRegExp = matchRegExp;

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
					if (_devices[i]) {
						this._deviceAdded(_devices[i]._getDescription(), _devices[i]);
					}
				}

				_devices.watch('length', function (property, from, to) {
					let _network = Main.panel.statusArea.aggregateMenu._network;
					let _devices = _network._devices.wired.devices;

					_devices.forEach(function (device, i) {
						this._deviceAdded(device._getDescription(), device);
					}.bind(this));
				}.bind(this));
			}
		}
	},

	_deviceAdded : function(deviceDescription, device) {
		if ( !this._matchRegExp.test(deviceDescription)) {
			return;
		}

		let _this = this;

		this._ethDevices[deviceDescription] = new Object();
		if(this._ethDevices[deviceDescription].timeoutId){
			Mainloop.source_remove(this._ethDevices[deviceDescription].timeoutId);
			this._ethDevices[deviceDescription].timeoutId = null;
		}

		log(this._extensionName + ' hide: ' + deviceDescription);
		device.item.actor.watch('visible', function (property, from, to) {
			if (to) {
				log(this._extensionName + ' rehide: ' + deviceDescription);
				device.item.actor.visible = false;
			}
		});

		device.item.actor.visible = false;
		this._ethDevices[deviceDescription].device = device;
	},

	_deviceRemoved : function(deviceDescription, device) {
		log(this._extensionName + ' show: ' + deviceDescription);
		device.item.actor.unwatch('visible');

		device.item.actor.visible = true;
		delete this._ethDevices[deviceDescription];
	},

	destroy : function() {
		Main.panel.statusArea.aggregateMenu._network._devices.wired.devices.unwatch('length');

		for ( var deviceDescription in this._ethDevices) {
			if (this._ethDevices.hasOwnProperty(deviceDescription)) {
				this._deviceRemoved(deviceDescription, this._ethDevices[deviceDescription].device);
			}
		}
	}
});
