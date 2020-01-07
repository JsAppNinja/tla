<?php

class com_wiris_common_WInteger {
	public function __construct(){}
	static function max($x, $y) {
		if($x > $y) {
			return $x;
		}
		return $y;
	}
	static function min($x, $y) {
		if($x < $y) {
			return $x;
		}
		return $y;
	}
	static function toHex($x, $digits) {
		$s = "";
		while($x !== 0 && $digits > 0) {
			$digits--;
			$d = $x & 15;
			$s = com_wiris_common_WInteger_0($d, $digits, $s, $x) . $s;
			$x = $x >> 4;
			unset($d);
		}
		while($digits-- > 0) {
			$s = "0" . $s;
		}
		return $s;
	}
	static function parseHex($str) {
		return Std::parseInt("0x" . $str);
	}
	static function isInteger($str) {
		$str = trim($str);
		$i = 0;
		$n = strlen($str);
		if(StringTools::startsWith($str, "-")) {
			$i++;
		}
		if(StringTools::startsWith($str, "+")) {
			$i++;
		}
		$c = null;
		while($i < $n) {
			$c = _hx_char_code_at($str, $i);
			if($c < 48 || $c > 57) {
				return false;
			}
			$i++;
		}
		return true;
	}
	function __toString() { return 'com.wiris.common.WInteger'; }
}
function com_wiris_common_WInteger_0(&$d, &$digits, &$s, &$x) {
	{
		$i = $d + ((($d >= 10) ? 55 : 48));
		$s1 = new haxe_Utf8(null);
		if($i < 65536) {
			$s1->addChar($i);
		} else {
			if($i <= 1114111) {
				$s1->addChar(($i >> 10) + 55232);
				$s1->addChar(($i & 1023) + 56320);
			} else {
				throw new HException("Invalid code point.");
			}
		}
		return $s1->toString();
	}
}
