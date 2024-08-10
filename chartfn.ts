/*
export default async function chartfn() {
	const tvurl = 'https://tradingview.com/chart';
	const res = await fetch(tvurl);
	return res;
}
*/
import { serveFile } from '@std/http/file-server';

export default async function chartfn(req: Request) {
	return serveFile(
		req,
		'./tv.html',
	);

	// const tvurl = 'https://tradingview.com/chart';
	// const res = await fetch(tvurl);
	// return res;
}
