const wsworker = new Worker(import.meta.resolve('./wsworker.ts'), {
	type: 'module',
});
wsworker.onmessage = async (e) => {
	const path1 = e.data;
	switch (path1) {
		case 'chart': {
			const tvurl = 'https://tradingview.com/chart';
			const res = await fetch(tvurl);
			return res;
		}
		case 'static': {
			break;
		}
		// case 'socket.io': {
		//  return socketiowebsocket(req);
		// }
		// case 'message-pipe-ws': {
		//  return messagepipews(req);
		// }
		default: {
			// console.log('luyou:', path1, pathsz);
			return new Response('404: Not Found', {
				status: 404,
			});
		}
	}
};

const luyou = async (req: Request) => {
	const pathname = new URL(req.url).pathname;
	wsworker.postMessage(pathname);
};

Deno.serve(luyou);
