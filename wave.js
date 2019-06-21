/*
 * Wavedata Generator
 * Copyright (C) 2014 OBN-soft
 * Version: 0.1.0
 * LastModified: Nov 15 2014
 * 
 * This software is released under the MIT License.
 * http://opensource.org/licenses/mit-license.php
 *
 * Referred to
 * http://www.kk.iij4u.or.jp/~kondo/wave/
 */

function generateWavData(hz, channels, bit, signals){
	if (channels != 1 && channels != 2) return null;
	if (bit != 8 && bit != 16) return null;
	
	var block = channels * bit / 8;
	var spd = hz * block;
	
	var header = "WAVEfmt "; // Wave header & "fmt" chunk label
	header += String.fromCharCode(16, 0, 0, 0); // Chunk Length = 16
	header += String.fromCharCode(1, 0); // FormatID = 1 (Linear PCM)
	header += String.fromCharCode(channels, 0);	// Channels
	header += String.fromCharCode(hz & 0xFF, hz >> 8 & 0xFF, hz >> 16 & 0xFF, hz >> 24 & 0xFF); // Sampling rate
	header += String.fromCharCode(spd & 0xFF, spd >> 8 & 0xFF, spd >> 16 & 0xFF, spd >> 24 & 0xFF); // Bytes / sec
	header += String.fromCharCode(block, 0); // Block size
	header += String.fromCharCode(bit, 0); // Bits / sample
	header += "data"; // "data" chunk label
	
	var siglen = signals.length;
	var sigsize = String.fromCharCode(siglen & 0xFF, siglen >> 8 & 0xFF, siglen >> 16 & 0xFF, siglen >> 24 & 0xFF);
	var wavlen = header.length + sigsize.length + siglen;
	var wavsize = String.fromCharCode(wavlen & 0xFF, wavlen >> 8 & 0xFF, wavlen >> 16 & 0xFF, wavlen >> 24 & 0xFF);
	
	return wavefile = "RIFF" + wavsize + header + sigsize + signals;
}
