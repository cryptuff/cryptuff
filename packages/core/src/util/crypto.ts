import { SHA256, HmacSHA512 } from "crypto-js";
import { base64ToBinary } from "./encoding";

type WordArray = CryptoJS.lib.WordArray;

export function sha256AsBinary(message: string) {
  return SHA256(message);
}

/**
 * Calculates the HMAC of a given message using SHA-512 and the given key
 * @param message Binary message to encode
 * @param key Encoding key. Either binary array or **Base64** string
 */
export function hmacSha512(message: WordArray, key: WordArray | string) {
  const binarySecret = typeof key === "string" ? base64ToBinary(key) : key;
  return HmacSHA512(message, binarySecret);
}
