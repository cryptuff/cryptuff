export { utf8ToBytes, base64ToBytes, bytesToBase64 } from "./hibase64";

// import CryptoJS from "crypto-js";

// type WordArray = CryptoJS.lib.WordArray;

// export function stringToBinary(str: string) {
//   const arr = new Uint8Array(str.length);
//   for (let i = 0; i < str.length; i++) {
//     arr[i] = str.charCodeAt(i);
//   }
//   return CryptoJS.lib.WordArray.create(arr);
// }

// export function binaryConcat(...args: WordArray[]) {
//   return args.reduce((a, b) => a.concat(b));
// }

// export function base64ToBinary(base64str: string) {
//   return CryptoJS.enc.Base64.parse(base64str) as WordArray;
// }

// export function binaryToBase64(binary: WordArray) {
//   return binary.toString(CryptoJS.enc.Base64);
// }
