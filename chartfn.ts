/*
export default async function chartfn() {
	const tvurl = 'https://tradingview.com/chart';
	const res = await fetch(tvurl);
	return res;
}
*/
const indexhtml = await Deno.readTextFile(
	'./tv.html',
);

export default async function chartfn() {
	return new Response(indexhtml, {
		status: 200,
	});

	// const tvurl = 'https://tradingview.com/chart';
	// const res = await fetch(tvurl);
	// return res;
}
