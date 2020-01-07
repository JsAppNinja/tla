<?php

class com_wiris_system_Utf8 {
	public function __construct() { 
	}
	static function findUTF8Position($s, $position, $carry8 = null, $carry16 = null) {
		if($carry16 === null) {
			$carry16 = 0;
		}
		if($carry8 === null) {
			$carry8 = 0;
		}
		$i8 = $carry8;
		$i16 = $carry16;
		$n8 = haxe_Utf8::length($s);
		while($i8 < $n8 && $i16 < $position) {
			$charCode = haxe_Utf8::charCodeAt($s, $i8);
			if($charCode < 55296 || $charCode > 56319) {
				++$i16;
			}
			++$i8;
			unset($charCode);
		}
		return $i8;
	}
	static function getLength($s) {
		$i8 = 0;
		$n8 = haxe_Utf8::length($s);
		$counter16 = 0;
		while($i8 < $n8) {
			$charCode = haxe_Utf8::charCodeAt($s, $i8);
			if($charCode < 55296 || $charCode > 56319) {
				++$counter16;
			}
			++$i8;
			unset($charCode);
		}
		return $counter16;
	}
	static function charCodeAt($s, $i) {
		$i8 = com_wiris_system_Utf8_0($i, $s);
		$charCode = haxe_Utf8::charCodeAt($s, $i8);
		return com_wiris_system_Utf8_1($charCode, $i, $i8, $s);
	}
	static function charAt($s, $i) {
		return com_wiris_system_Utf8_2($i, $s);
	}
	static function uchr($i) {
		$s = new haxe_Utf8(null);
		if($i < 65536) {
			$s->addChar($i);
		} else {
			if($i <= 1114111) {
				$s->addChar(($i >> 10) + 55232);
				$s->addChar(($i & 1023) + 56320);
			} else {
				throw new HException("Invalid code point.");
			}
		}
		return $s->toString();
	}
	static function sub($s, $pos, $len) {
		$start = com_wiris_system_Utf8_3($len, $pos, $s);
		$end = com_wiris_system_Utf8_4($len, $pos, $s, $start);
		return haxe_Utf8::sub($s, $start, $end - $start);
	}
	static function toBytes($s) {
		return haxe_io_Bytes::ofString($s)->b;
	}
	static function fromBytes($s) {
		$bs = haxe_io_Bytes::ofData($s);
		return $bs->toString();
	}
	function __toString() { return 'com.wiris.system.Utf8'; }
}
function com_wiris_system_Utf8_0(&$i, &$s) {
	{
		$i8 = 0;
		$i16 = 0;
		$n8 = haxe_Utf8::length($s);
		while($i8 < $n8 && $i16 < $i) {
			$charCode = haxe_Utf8::charCodeAt($s, $i8);
			if($charCode < 55296 || $charCode > 56319) {
				++$i16;
			}
			++$i8;
			unset($charCode);
		}
		return $i8;
	}
}
function com_wiris_system_Utf8_1(&$charCode, &$i, &$i8, &$s) {
	if($charCode < 55296 || $charCode > 56319) {
		return $charCode;
	} else {
		return ($charCode - 55296) * 1024 + haxe_Utf8::charCodeAt($s, $i8 + 1) - 56320 + 65536;
	}
}
function com_wiris_system_Utf8_2(&$i, &$s) {
	{
		$i1 = com_wiris_system_Utf8_5($i, $s);
		$s1 = new haxe_Utf8(null);
		if($i1 < 65536) {
			$s1->addChar($i1);
		} else {
			if($i1 <= 1114111) {
				$s1->addChar(($i1 >> 10) + 55232);
				$s1->addChar(($i1 & 1023) + 56320);
			} else {
				throw new HException("Invalid code point.");
			}
		}
		return $s1->toString();
	}
}
function com_wiris_system_Utf8_3(&$len, &$pos, &$s) {
	{
		$i8 = 0;
		$i16 = 0;
		$n8 = haxe_Utf8::length($s);
		while($i8 < $n8 && $i16 < $pos) {
			$charCode = haxe_Utf8::charCodeAt($s, $i8);
			if($charCode < 55296 || $charCode > 56319) {
				++$i16;
			}
			++$i8;
			unset($charCode);
		}
		return $i8;
	}
}
function com_wiris_system_Utf8_4(&$len, &$pos, &$s, &$start) {
	{
		$i8 = $start;
		$i16 = $pos;
		$n8 = haxe_Utf8::length($s);
		while($i8 < $n8 && $i16 < $pos + $len) {
			$charCode = haxe_Utf8::charCodeAt($s, $i8);
			if($charCode < 55296 || $charCode > 56319) {
				++$i16;
			}
			++$i8;
			unset($charCode);
		}
		return $i8;
	}
}
function com_wiris_system_Utf8_5(&$i, &$s) {
	{
		$i8 = com_wiris_system_Utf8_6($i, $s);
		$charCode = haxe_Utf8::charCodeAt($s, $i8);
		if($charCode < 55296 || $charCode > 56319) {
			return $charCode;
		} else {
			return ($charCode - 55296) * 1024 + haxe_Utf8::charCodeAt($s, $i8 + 1) - 56320 + 65536;
		}
		unset($i8,$charCode);
	}
}
function com_wiris_system_Utf8_6(&$i, &$s) {
	{
		$i8 = 0;
		$i16 = 0;
		$n8 = haxe_Utf8::length($s);
		while($i8 < $n8 && $i16 < $i) {
			$charCode = haxe_Utf8::charCodeAt($s, $i8);
			if($charCode < 55296 || $charCode > 56319) {
				++$i16;
			}
			++$i8;
			unset($charCode);
		}
		return $i8;
	}
}
