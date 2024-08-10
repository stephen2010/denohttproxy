self.onmessage = (e: MessageEvent) => {
	const pathname = e.data;
	const pathsz = pathname.split('/');
	let path1 = pathsz.shift();
	if (pathsz.length != 0) {
		path1 = pathsz.shift();
	}
	self.postMessage(path1);
};
