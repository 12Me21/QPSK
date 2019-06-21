/*
 * Petitcom 3 QPSK Modulater
 * Copyright (C) 2014 OBN-soft
 * Version: 0.2.1
 * LastModified: Nov 27 2014
 * 
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 * 
 * This module depends on the following JavaScripts:
 *  - "wave.js"
 *  - "md5.js", "base64.js"
 *    http://www.onicos.com/staff/iz/amuse/javascript/expert/
 */

var elmDivInfo;
var elmAudioPlay;

var rs_ary = [
	0x00, 0x0f, 0x15, 0x1a, 0x23, 0x2c, 0x36, 0x39,
	0x46, 0x49, 0x53, 0x5c, 0x65, 0x6a, 0x70, 0x7f,
];
var ptn_ary = [
	String.fromCharCode(0x40, 0x40, 0x40, 0x40, 0x40, 0x40, 0xC0, 0xC0, 0xC0, 0xC0, 0xC0, 0xC0), // 00 -> phase 1/2
	String.fromCharCode(0xC0, 0xC0, 0xC0, 0x40, 0x40, 0x40, 0x40, 0x40, 0x40, 0xC0, 0xC0, 0xC0), // 01 -> phase 1/4
	String.fromCharCode(0x40, 0x40, 0x40, 0xC0, 0xC0, 0xC0, 0xC0, 0xC0, 0xC0, 0x40, 0x40, 0x40), // 10 -> phase 3/4
	String.fromCharCode(0xC0, 0xC0, 0xC0, 0xC0, 0xC0, 0xC0, 0x40, 0x40, 0x40, 0x40, 0x40, 0x40), // 11 -> phase 0
];

function $(id) {
	return document.getElementById(id);
}

function setDivElementForInfo(element) {
	elmDivInfo = element;
}

function setAudioElementForData(element) {
	elmAudioPlay = element;
}

/*--------*/

function fileOpen(evt) {
	elmAudioPlay.src = null;
	displayInfo(null);
	var files = evt.target.files;
	if (files.length == 0) return;
	var file = files[0];
	var reader = new FileReader();
	reader.onload = function(evt) {
		var data = reader.result;
		displayInfo(data);

		var i, len = data.length, signals = "";
		for (i = 0; i < len; i += 512) {
			signals += createSyncSignal() + createDataSignal(data.substr(i, 512));
			if (i % 3 == 0) signals += String.fromCharCode(0xC0, 0x40);
		}
		var wavedata = generateWavData(8182 * 3, 1, 8, signals);
		var dataurl = "data:audio/wav;base64," + base64encode(wavefile);
		elmAudioPlay.src = dataurl;
	}
	reader.readAsBinaryString(file);
}

/*--------*/

function displayInfo(data) {
	var i, text;
	for (i = elmDivInfo.childNodes.length - 1; i >= 0; i--) {
		elmDivInfo.removeChild(elmDivInfo.childNodes[i]);
	}

	text = "Data size: ";
	if (data) text += data.length + " bytes";
	appendInfo(text);

	text = "MD5 Digest: ";
	if (data) {
		var md5 = MD5_hash(data);
		for (i = 0; i < 16; i++) {
			text += ("0" + md5.charCodeAt(i).toString(16)).slice(-2);
		}
	}
	appendInfo(text);

	text = "Checksum: ";
	if (data) {
		var sum = 0;
		for (i = 0; i < data.length; i++) {
			sum += (data.charCodeAt(i) ^ i * 23) & 0xFF;
		}
		text += sum;
	}
	appendInfo(text);

}

function appendInfo(text) {
	elmDivInfo.appendChild(document.createTextNode(text));
	elmDivInfo.appendChild(document.createElement("br"));
}

/*--------*/

function createSyncSignal() {
	var i;
	var signals = "";

	for (i = 0; i < 128; i++) {
		signals += String.fromCharCode(0xC0, 0xC0, 0xC0, 0xC0, 0xC0, 0xC0, 0xC0, 0xC0, 0xC0, 0xC0, 0xC0, 0xC0);
		signals += String.fromCharCode(0x40, 0x40, 0x40, 0x40, 0x40, 0x40, 0x40, 0x40, 0x40, 0x40, 0x40, 0x40);
	}
	return signals;
}

function createDataSignal(data) {
	var i, j, val, rs_val;
	var len = data.length;
	var signals = "";

	for (i = 0; i < len; i++) {
		val = data.charCodeAt(i);
		rs_val = rs_ary[val >> 4 & 0xf] << 7 | rs_ary[val & 0xf];
		for (j = 12; j >= 0; j -= 2) {
			signals += ptn_ary[rs_val >> j & 3];
		}
	}
	return signals;
}
