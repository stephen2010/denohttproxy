import { chartfn, staticfn } from './chartfn.ts';
const luyou = async (req: Request) => {
	const pathname = new URL(req.url).pathname;
	const pathsz = pathname.split('/');
	let path1 = pathsz.shift();
	if (pathsz.length != 0) {
		path1 = pathsz.shift();
	}
	switch (path1) {
		case 'chart': {
			return chartfn(req);
		}
		case 'static': {
			return staticfn(path1);
		}
		// case 'socket.io': {
		//  return socketiowebsocket(req);
		// }
		// case 'message-pipe-ws': {
		//  return messagepipews(req);
		// }
		default: {
			return new Response('404: Not Found', {
				status: 404,
			});
		}
	}
};

Deno.serve(luyou);
