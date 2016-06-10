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

// Other javascript files in the docker-integration@jan.trejbal.gmail.com directory are accesible via Extension.<file name>
const Extension = imports.misc.extensionUtils.getCurrentExtension();
const DockerNetworkManager = Extension.imports.DockerNetworkManager;

//const Menu = Extension.imports.menu;
//const Panel = Extension.imports.panel;
//const Settings = Extension.imports.settings;

//const Gettext = imports.gettext; 
//const _ = Gettext.gettext;

let extensionName = Extension.dir.get_basename();
let matchRegExp = /^Ethernet \(veth[a-z0-9]+\)$|^$/i;

let _instance_dockerNetworkManager;

function createDockerNetworkManager() {
	_instance_dockerNetworkManager = new DockerNetworkManager.DockerNetworkManager(extensionName, matchRegExp);
}

function destroyDockerNetworkManager() {
	_instance_dockerNetworkManager.destroy();
	_instance_dockerNetworkManager = null;
}

function enable() {
	createDockerNetworkManager();
}

function disable() {
	destroyDockerNetworkManager();
}
