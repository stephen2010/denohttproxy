
const luyou = (req: Request) => {
	const pathname = new URL(req.url).pathname;
	const pathsz = pathname.split('/');
	let path1 = pathsz.shift();
	if (pathsz.length != 0) {
		path1 = pathsz.shift();
	}
	switch (path1) {
		case 'chart': {
			const tvurl = "https://tradingview.com/chart";
			 return await fetch(tvurl);
		}
		case 'static': {
			break;
		}
		// case 'socket.io': {
		// 	return socketiowebsocket(req);
		// }
		// case 'message-pipe-ws': {
		// 	return messagepipews(req);
		// }
		default: {
			// console.log('luyou:', path1, pathsz);
			return new Response('404: Not Found', {
				status: 404,
			});
		}
	}
}

Deno.serve(luyou);
