// Based on https://github.com/emn178/hi-base64

const NODE_JS = typeof process === "object" && process.versions && process.versions.node;

declare var window: any;
const root = typeof window === "object" ? window : global;
const BASE64_ENCODE_CHAR = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split(
  "",
);
const BASE64_DECODE_CHAR = BASE64_ENCODE_CHAR.reduce(
  (acc, char, i) => ({ ...acc, ...{ [char]: i } }),
  { "-": 62, _: 63 } as { [k: string]: number },
);

function _utf8ToBytes(str: string) {
  const bytes = [];
  for (let i = 0; i < str.length; i++) {
    let c = str.charCodeAt(i);
    if (c < 0x80) {
      bytes[bytes.length] = c;
    } else if (c < 0x800) {
      bytes[bytes.length] = 0xc0 | (c >> 6);
      bytes[bytes.length] = 0x80 | (c & 0x3f);
    } else if (c < 0xd800 || c >= 0xe000) {
      bytes[bytes.length] = 0xe0 | (c >> 12);
      bytes[bytes.length] = 0x80 | ((c >> 6) & 0x3f);
      bytes[bytes.length] = 0x80 | (c & 0x3f);
    } else {
      c = 0x10000 + (((c & 0x3ff) << 10) | (str.charCodeAt(++i) & 0x3ff));
      bytes[bytes.length] = 0xf0 | (c >> 18);
      bytes[bytes.length] = 0x80 | ((c >> 12) & 0x3f);
      bytes[bytes.length] = 0x80 | ((c >> 6) & 0x3f);
      bytes[bytes.length] = 0x80 | (c & 0x3f);
    }
  }
  return bytes;
}

function _base64ToBytes(base64Str: string) {
  var v1,
    v2,
    v3,
    v4,
    bytes = [],
    index = 0,
    length = base64Str.length;
  if (base64Str.charAt(length - 2) === "=") {
    length -= 2;
  } else if (base64Str.charAt(length - 1) === "=") {
    length -= 1;
  }

  // 4 char to 3 bytes
  for (var i = 0, count = (length >> 2) << 2; i < count; ) {
    v1 = BASE64_DECODE_CHAR[base64Str.charAt(i++)];
    v2 = BASE64_DECODE_CHAR[base64Str.charAt(i++)];
    v3 = BASE64_DECODE_CHAR[base64Str.charAt(i++)];
    v4 = BASE64_DECODE_CHAR[base64Str.charAt(i++)];
    bytes[index++] = ((v1 << 2) | (v2 >>> 4)) & 255;
    bytes[index++] = ((v2 << 4) | (v3 >>> 2)) & 255;
    bytes[index++] = ((v3 << 6) | v4) & 255;
  }

  // remain bytes
  var remain = length - count;
  if (remain === 2) {
    v1 = BASE64_DECODE_CHAR[base64Str.charAt(i++)];
    v2 = BASE64_DECODE_CHAR[base64Str.charAt(i++)];
    bytes[index++] = ((v1 << 2) | (v2 >>> 4)) & 255;
  } else if (remain === 3) {
    v1 = BASE64_DECODE_CHAR[base64Str.charAt(i++)];
    v2 = BASE64_DECODE_CHAR[base64Str.charAt(i++)];
    v3 = BASE64_DECODE_CHAR[base64Str.charAt(i++)];
    bytes[index++] = ((v1 << 2) | (v2 >>> 4)) & 255;
    bytes[index++] = ((v2 << 4) | (v3 >>> 2)) & 255;
  }
  return bytes;
}

function _bytesToBase64(bytes: number[] | Uint8Array) {
  let v1,
    v2,
    v3,
    base64Str = "",
    length = bytes.length;
  for (var i = 0, count = Math.floor(length / 3) * 3; i < count; ) {
    v1 = bytes[i++];
    v2 = bytes[i++];
    v3 = bytes[i++];
    base64Str +=
      BASE64_ENCODE_CHAR[v1 >>> 2] +
      BASE64_ENCODE_CHAR[((v1 << 4) | (v2 >>> 4)) & 63] +
      BASE64_ENCODE_CHAR[((v2 << 2) | (v3 >>> 6)) & 63] +
      BASE64_ENCODE_CHAR[v3 & 63];
  }

  // remain char
  let remain = length - count;
  if (remain === 1) {
    v1 = bytes[i];
    base64Str += BASE64_ENCODE_CHAR[v1 >>> 2] + BASE64_ENCODE_CHAR[(v1 << 4) & 63] + "==";
  } else if (remain === 2) {
    v1 = bytes[i++];
    v2 = bytes[i];
    base64Str +=
      BASE64_ENCODE_CHAR[v1 >>> 2] +
      BASE64_ENCODE_CHAR[((v1 << 4) | (v2 >>> 4)) & 63] +
      BASE64_ENCODE_CHAR[(v2 << 2) & 63] +
      "=";
  }
  return base64Str;
}

const _basics = (() => {
  var btoa: (s: string) => string,
    atob: (s: string) => string,
    utf8ToBase64: (utf8String: string) => string,
    base64ToUtf8: (base64String: string) => string;

  if (NODE_JS && typeof Buffer !== undefined) {
    // NODEJS -> Use `Buffer` API
    // var Buffer = Buffer;
    btoa = (str: string) => new Buffer(str, "ascii").toString("base64");
    atob = (base64Str: string) => new Buffer(base64Str, "base64").toString("ascii");

    utf8ToBase64 = (str: string) => new Buffer(str).toString("base64");
    // bytesToBase64 = utf8ToBase64;
    base64ToUtf8 = (base64Str: string) => new Buffer(base64Str, "base64").toString();
  } else if (root.btoa && root.atob) {
    // Browser implementing `atob` and `btoa` -> Use them
    btoa = root.btoa;
    atob = root.atob;
    utf8ToBase64 = function(str: string) {
      var result = "";
      for (var i = 0; i < str.length; i++) {
        var charcode = str.charCodeAt(i);
        if (charcode < 0x80) {
          result += String.fromCharCode(charcode);
        } else if (charcode < 0x800) {
          result +=
            String.fromCharCode(0xc0 | (charcode >> 6)) +
            String.fromCharCode(0x80 | (charcode & 0x3f));
        } else if (charcode < 0xd800 || charcode >= 0xe000) {
          result +=
            String.fromCharCode(0xe0 | (charcode >> 12)) +
            String.fromCharCode(0x80 | ((charcode >> 6) & 0x3f)) +
            String.fromCharCode(0x80 | (charcode & 0x3f));
        } else {
          charcode = 0x10000 + (((charcode & 0x3ff) << 10) | (str.charCodeAt(++i) & 0x3ff));
          result +=
            String.fromCharCode(0xf0 | (charcode >> 18)) +
            String.fromCharCode(0x80 | ((charcode >> 12) & 0x3f)) +
            String.fromCharCode(0x80 | ((charcode >> 6) & 0x3f)) +
            String.fromCharCode(0x80 | (charcode & 0x3f));
        }
      }
      return btoa(result);
    };

    base64ToUtf8 = function(base64Str: string) {
      var tmpStr = atob(
        base64Str
          .replace(/=*$/g, "")
          .replace(/-/g, "+")
          .replace(/_/g, "/"),
      );
      if (!/[^\x00-\x7F]/.test(tmpStr)) {
        return tmpStr;
      }
      var str = "",
        i = 0,
        length = tmpStr.length,
        followingChars = 0,
        b,
        c;
      while (i < length) {
        b = tmpStr.charCodeAt(i++);
        if (b <= 0x7f) {
          str += String.fromCharCode(b);
          continue;
        } else if (b > 0xbf && b <= 0xdf) {
          c = b & 0x1f;
          followingChars = 1;
        } else if (b <= 0xef) {
          c = b & 0x0f;
          followingChars = 2;
        } else if (b <= 0xf7) {
          c = b & 0x07;
          followingChars = 3;
        } else {
          throw "not a UTF-8 string";
        }

        for (var j = 0; j < followingChars; ++j) {
          b = tmpStr.charCodeAt(i++);
          if (b < 0x80 || b > 0xbf) {
            throw "not a UTF-8 string";
          }
          c <<= 6;
          c += b & 0x3f;
        }
        if (c >= 0xd800 && c <= 0xdfff) {
          throw "not a UTF-8 string";
        }
        if (c > 0x10ffff) {
          throw "not a UTF-8 string";
        }

        if (c <= 0xffff) {
          str += String.fromCharCode(c);
        } else {
          c -= 0x10000;
          str += String.fromCharCode((c >> 10) + 0xd800);
          str += String.fromCharCode((c & 0x3ff) + 0xdc00);
        }
      }
      return str;
    };
  } else {
    // Browser NOT implementing `atob` and `btoa` -> polyfill
    btoa = function(str: string) {
      var v1,
        v2,
        v3,
        base64Str = "",
        length = str.length;
      for (var i = 0, count = Math.floor(length / 3) * 3; i < count; ) {
        v1 = str.charCodeAt(i++);
        v2 = str.charCodeAt(i++);
        v3 = str.charCodeAt(i++);
        base64Str +=
          BASE64_ENCODE_CHAR[v1 >>> 2] +
          BASE64_ENCODE_CHAR[((v1 << 4) | (v2 >>> 4)) & 63] +
          BASE64_ENCODE_CHAR[((v2 << 2) | (v3 >>> 6)) & 63] +
          BASE64_ENCODE_CHAR[v3 & 63];
      }

      // remain char
      var remain = length - count;
      if (remain === 1) {
        v1 = str.charCodeAt(i);
        base64Str += BASE64_ENCODE_CHAR[v1 >>> 2] + BASE64_ENCODE_CHAR[(v1 << 4) & 63] + "==";
      } else if (remain === 2) {
        v1 = str.charCodeAt(i++);
        v2 = str.charCodeAt(i);
        base64Str +=
          BASE64_ENCODE_CHAR[v1 >>> 2] +
          BASE64_ENCODE_CHAR[((v1 << 4) | (v2 >>> 4)) & 63] +
          BASE64_ENCODE_CHAR[(v2 << 2) & 63] +
          "=";
      }
      return base64Str;
    };

    utf8ToBase64 = function(utf8String: string) {
      var v1,
        v2,
        v3,
        base64Str = "",
        bytes = utf8ToBytes(utf8String),
        length = bytes.length;
      for (var i = 0, count = Math.floor(length / 3) * 3; i < count; ) {
        v1 = bytes[i++];
        v2 = bytes[i++];
        v3 = bytes[i++];
        base64Str +=
          BASE64_ENCODE_CHAR[v1 >>> 2] +
          BASE64_ENCODE_CHAR[((v1 << 4) | (v2 >>> 4)) & 63] +
          BASE64_ENCODE_CHAR[((v2 << 2) | (v3 >>> 6)) & 63] +
          BASE64_ENCODE_CHAR[v3 & 63];
      }

      // remain char
      var remain = length - count;
      if (remain === 1) {
        v1 = bytes[i];
        base64Str += BASE64_ENCODE_CHAR[v1 >>> 2] + BASE64_ENCODE_CHAR[(v1 << 4) & 63] + "==";
      } else if (remain === 2) {
        v1 = bytes[i++];
        v2 = bytes[i];
        base64Str +=
          BASE64_ENCODE_CHAR[v1 >>> 2] +
          BASE64_ENCODE_CHAR[((v1 << 4) | (v2 >>> 4)) & 63] +
          BASE64_ENCODE_CHAR[(v2 << 2) & 63] +
          "=";
      }
      return base64Str;
    };

    atob = function(base64Str: string) {
      var v1,
        v2,
        v3,
        v4,
        str = "",
        length = base64Str.length;
      if (base64Str.charAt(length - 2) === "=") {
        length -= 2;
      } else if (base64Str.charAt(length - 1) === "=") {
        length -= 1;
      }

      // 4 char to 3 bytes
      for (var i = 0, count = (length >> 2) << 2; i < count; ) {
        v1 = BASE64_DECODE_CHAR[base64Str.charAt(i++)];
        v2 = BASE64_DECODE_CHAR[base64Str.charAt(i++)];
        v3 = BASE64_DECODE_CHAR[base64Str.charAt(i++)];
        v4 = BASE64_DECODE_CHAR[base64Str.charAt(i++)];
        str +=
          String.fromCharCode(((v1 << 2) | (v2 >>> 4)) & 255) +
          String.fromCharCode(((v2 << 4) | (v3 >>> 2)) & 255) +
          String.fromCharCode(((v3 << 6) | v4) & 255);
      }

      // remain bytes
      var remain = length - count;
      if (remain === 2) {
        v1 = BASE64_DECODE_CHAR[base64Str.charAt(i++)];
        v2 = BASE64_DECODE_CHAR[base64Str.charAt(i++)];
        str += String.fromCharCode(((v1 << 2) | (v2 >>> 4)) & 255);
      } else if (remain === 3) {
        v1 = BASE64_DECODE_CHAR[base64Str.charAt(i++)];
        v2 = BASE64_DECODE_CHAR[base64Str.charAt(i++)];
        v3 = BASE64_DECODE_CHAR[base64Str.charAt(i++)];
        str +=
          String.fromCharCode(((v1 << 2) | (v2 >>> 4)) & 255) +
          String.fromCharCode(((v2 << 4) | (v3 >>> 2)) & 255);
      }
      return str;
    };

    base64ToUtf8 = function(base64Str: string) {
      var str = "",
        bytes = _base64ToBytes(base64Str),
        length = bytes.length;
      var i = 0,
        followingChars = 0,
        b,
        c;
      while (i < length) {
        b = bytes[i++];
        if (b <= 0x7f) {
          str += String.fromCharCode(b);
          continue;
        } else if (b > 0xbf && b <= 0xdf) {
          c = b & 0x1f;
          followingChars = 1;
        } else if (b <= 0xef) {
          c = b & 0x0f;
          followingChars = 2;
        } else if (b <= 0xf7) {
          c = b & 0x07;
          followingChars = 3;
        } else {
          throw "not a UTF-8 string";
        }

        for (var j = 0; j < followingChars; ++j) {
          b = bytes[i++];
          if (b < 0x80 || b > 0xbf) {
            throw "not a UTF-8 string";
          }
          c <<= 6;
          c += b & 0x3f;
        }
        if (c >= 0xd800 && c <= 0xdfff) {
          throw "not a UTF-8 string";
        }
        if (c > 0x10ffff) {
          throw "not a UTF-8 string";
        }

        if (c <= 0xffff) {
          str += String.fromCharCode(c);
        } else {
          c -= 0x10000;
          str += String.fromCharCode((c >> 10) + 0xd800);
          str += String.fromCharCode((c & 0x3ff) + 0xdc00);
        }
      }
      return str;
    };
  }
  return { btoa, atob, utf8ToBase64, base64ToUtf8 };
})();

// export const base64ToAscii = (base64Str: string) => _basics.atob(base64Str);

/**
 * Converts an UTF-8 string to an array of [0-255] numbers
 * @param str UTF-8 string
 */
export const utf8ToBytes = _utf8ToBytes;

/**
 * Encodes an array of [0,255] numbers into a Base64 string
 * @param bytes array of [0,255] numbers
 */
export const bytesToBase64 = _bytesToBase64;

/**
 * Encodes a UTF8 string into a Base64 string
 * @param utf8String UTF8 string
 */
export const utf8ToBase64 = _basics.utf8ToBase64;

/**
 * Decodes a base-64 encoded string to an array of [0-255] numbers
 * @param base64Str Base64 encoded string
 */
export const base64ToBytes = _base64ToBytes;

/**
 * Decodes a base-64 encoded string to a UTF8 string
 * @param base64Str Base64 encoded string
 */
export const base64ToUtf8 = _basics.base64ToUtf8;

/**
 * Encodes an input to Base64
 * @param input Can be `string`, `ArrayBuffer` or an array of [0,255] numbers
 * @param asciiOnly
 */
export function base64Encode(input: string | ArrayBuffer | number[], asciiOnly: boolean = false) {
  if (typeof ArrayBuffer === "function" && input instanceof ArrayBuffer) {
    var arr = new Uint8Array(input);
    return _bytesToBase64(arr);
  }
  if (Array.isArray(input)) {
    return _bytesToBase64(input);
  }
  const str = input as string;
  if (!asciiOnly && /[^\x00-\x7F]/.test(str)) {
    return _basics.utf8ToBase64(str);
  }
  return _basics.btoa(str);
}
