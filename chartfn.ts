/*
export default async function chartfn() {
	const tvurl = 'https://tradingview.com/chart';
	const res = await fetch(tvurl);
	return res;
}
*/
import { serveFile } from 'jsr:@std/http/file-server.ts';

export async function chartfn(req: Request) {
	return serveFile(
		req,
		'./tv.html',
	);
}

export async function chartfn(path1: string) {
	const tvurl = 'https://static.tradingview.com/';
	const res = await fetch(tvurl + path1);
	return res;
}
