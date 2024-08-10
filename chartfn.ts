/*
export default async function chartfn() {
	const tvurl = 'https://tradingview.com/chart';
	const res = await fetch(tvurl);
	return res;
}
*/
import { serveFile } from 'jsr:@std/http/file-server';

export async function chartfn(req: Request) {
	return serveFile(
		req,
		'./tv.html',
	);
}

export async function staticfn(path1: string) {
	const tvurl = 'https://static.tradingview.com';
	const res = await fetch(tvurl + path1);
	return res;
}

const ws1out = new WebSocket('wss://data.tradingview.com');

export function socketiowebsocket(req: Request) {
	const { socket: ws1, response } = Deno.upgradeWebSocket(req);
	ws1out.onmessage = (e) => {
		const shuju = e.data;
		ws1.send(shuju);
	};
	ws1out.onopen = () => {};
	ws1out.onerror = (e) => {
		ws1out.close();
	};
	ws1out.onclose = () => {
	};

	ws1.onopen = () => {
	};
	ws1.onmessage = (e) => {
		const shuju = e.data;
		ws1out.send(shuju);
	};
	ws1.onerror = (e) => {
		ws1.close();
	};
	ws1.onclose = () => {
	};
	return response;
}

export function messagepipews(req: Request) {
}
