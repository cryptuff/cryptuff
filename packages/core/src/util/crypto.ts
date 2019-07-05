import { sha256 } from "js-sha256";
import { sha512 } from "js-sha512";
import { base64ToBytes, bytesToBase64 } from "./encoding";

/**
 * Hashes the input with SHA256 and returns as an
 * @param message message as a plain string
 */
export function sha256AsBytes(message: string) {
  return sha256.array(message);
}

/**
 * Run HMAC with SHA512 on the given input with the given key, and returns as a base 64 digest
 * @param base64Secret API secret in base64
 * @param messageBytes Message as an array of bytes
 */
export function hmacSha512AsBase64Digest(base64Secret: string, messageBytes: number[]) {
  const secretBytes = base64ToBytes(base64Secret);
  const hmac = sha512.hmac.create(secretBytes as any);
  hmac.update(messageBytes);
  const hmacBytes = hmac.array();
  const hmacBase64Digest = bytesToBase64(hmacBytes);
  return hmacBase64Digest;
}

// import { SHA256, HmacSHA512 } from "crypto-js";
// import { base64ToBinary } from "./encoding";

// type WordArray = CryptoJS.lib.WordArray;

// export function sha256AsBinary(message: string) {
//   return SHA256(message);
// }

// /**
//  * Calculates the HMAC of a given message using SHA-512 and the given key
//  * @param message Binary message to encode
//  * @param key Encoding key. Either binary array or **Base64** string
//  */
// export function hmacSha512(message: WordArray, key: WordArray | string) {
//   const binarySecret = typeof key === "string" ? base64ToBinary(key) : key;
//   return HmacSHA512(message, binarySecret);
// }
