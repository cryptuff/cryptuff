const PROD_ENDPOINT = "wss://ws.kraken.com";

export class KrakenClient {
  private endpoint = PROD_ENDPOINT;
  private ws?: WebSocket;

  constructor() {
    // this.ws = new WebSocket(this.endpoint);
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.endpoint);
      this.ws.onopen = ev => {
        resolve(ev);
      };
    });
  }
}

// let ws: WebSocket;
// function connect(callback) {
//   ws = new WebSocket(PROD_ENDPOINT);
//   ws.onopen = data => {
//     callback(data);
//   };
// }

// function subscribe(callback) {
//   // Event handler for receiving text messages
//   ws.nmessag = data => {
//     if (data.type === "close") {
//       return;
//     }
//     let json = JSON.parse(data.data);
//     if (json.event === "heartbeat") {
//       //Dont show heart beat messages
//       return;
//     }
//     callback(data);
//   };

//   // Event handler for errors in the WebSocket object
//   ws.onerror = data => {
//     console.log(data);
//     //callback(data)
//   };

//   // Listen for the close connection event
//   ws.onclose = data => {
//     ws = undefined;
//     callback(data);
//   };
// }

// function isConnected() {
//   if (ws === undefined) {
//     return false;
//   }
//   return ws.readyState === "CONNECTING" ? false : true;
// }

// function disconnect() {
//   ws.close();
// }

// function getProtocol() {
//   return isConnected() ? ws.protocol : "";
// }

// function sendPayload(payload) {
//   if (isConnected()) {
//     ws.send(payload);
//   }
// }
// export {
//   connect,
//   subscribe,
//   disconnect,
//   isConnected,
//   getProtocol,
//   sendPayload
// };
// //for more Information: https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_client_applications
