import { readLines } from "jsr:@std/io/read-lines";

const BUILD_TIME = "2024_08_19-13_26";
const WEBSOCKET_CONNECTION_TYPE = "chart";
// /socket.io/websocket?from=chart&date=2024_08_19-13_26&type=chart
const target = "wss://data.tradingview.com/socket.io/websocket"; //"?from=chart&date="+  BUILD_TIME + "&type=" + WEBSOCKET_CONNECTION_TYPE
console.log(target);

const ws = new WebSocket(target, {
  origin: "data.tradingview.com",
});

let fileReader = await Deno.open("./wsendmeg.txt");
// for await (let line of readLines(fileReader)) {
// console.log(line);
// ws.send(line);
// }

ws.onopen = async () => {
  console.log(ws.readyState);
  // const line = r.line;
  // ws.send(line);
};
ws.onmessage = async (e) => {
  console.log(e.data);
  // ws.close();
};
ws.onclose = () => {
};

ws.onerror = (e) => {
  console.log("onerror", e);
};
