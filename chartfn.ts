export async function chartfn() {
	const tvurl = 'https://tradingview.com/chart';
	const res = await fetch(tvurl);
	return res;
}
