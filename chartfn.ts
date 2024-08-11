import { serveFile } from "jsr:@std/http/file-server";

const regex1 = /https\:\/\/static\.tradingview\.com/g;
const regex2 = /data\.tradingview\.com/i;

export async function chartfn(req: Request) {
  /*
  console.log(req.headers);
  console.log(req.headers.get("accept"));
  return serveFile(
    req,
    "./tv.html",
  );
  */
  const tvurl = "https://tradingview.com/chart";
  const res = await fetch(tvurl, req);
  const indexhtml = await res.text();
  let gaiguo = indexhtml.replace(regex1, "");
  gaiguo = gaiguo.replace(regex2, "wp3.deno.dev");

  return new Response(gaiguo, res);
}

export async function staticfn(req: Request, pathname: string) {
  const tvurl = "https://static.tradingview.com";
  const res = await fetch(tvurl + pathname);
  return res;
  // return new Response("404: Not Found", {
  //   status: 404,
  // });
}

export function socketiowebsocket(
  req: Request,
  pathname: string,
  urlsearch: string,
) {
  const ws1out = new WebSocket(
    "wss://data.tradingview.com" + pathname + urlsearch,
  );

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

const messagepipestr = {
  "id": 11560,
  "channel": "public",
  "text": {
    "content": {
      "operation": "update",
      "stream": {
        "startTime": "2023-09-05T23:01:47.792000+00:00",
        "encoderId": null,
        "category": "Education",
        "visibility": "public",
        "url": "FgaCmfs8ej",
        "author": {
          "id": 465801,
          "is_paid_pro": true,
          "avatars": {
            "big":
              "https:\/\/s3.tradingview.com\/userpics\/465801-j8bl_big.png",
            "orig":
              "https:\/\/s3.tradingview.com\/userpics\/465801-j8bl_orig.png",
            "mid":
              "https:\/\/s3.tradingview.com\/userpics\/465801-j8bl_mid.png",
            "small": "https:\/\/s3.tradingview.com\/userpics\/465801-j8bl.png",
          },
          "youtube_channel":
            "https:\/\/www.youtube.com\/channel\/UCCMEE5STy0TQdEn6VuhVasw",
          "instagram_username": "fxktrading",
          "badges": [{
            "name": "pro:pro_premium",
            "verbose_name": "Premium",
          }],
          "signature":
            "Join us Today www.fxktrading.com start getting results!\r\nFollow us on telegram https:\/\/t.me\/Fxkcommunitychat\r\nContact me deandreforex@gmail.com with any questions about trading! \r\n My Broker https:\/\/login.hankotrade.com\/register?franchiseLead=MjYzMg==",
          "pro_plan": "pro_premium",
          "is_trial": false,
          "broker_plan": null,
          "youtube_channel_name": "fxktrading",
          "username": "fxktradingco",
          "is_broker": false,
          "twitter_username": "",
          "website": "https:\/\/www.fxktrading.com",
          "facebook_username": "fxktrading",
          "is_pro": true,
          "is_moderator": false,
        },
        "userId": 465801,
        "description":
          "Chart Session... ð Tune in to see what i will be trading for this Week! CHART TIME! Let's see what opportunities are showing ð 8 years of experience ðð½ð â¤ï¸Please support by liking\/boosting the stream, thank you!â¤ï¸",
        "twitchId": null,
        "record": true,
        "permanent": false,
        "youtubeId": null,
        "endTime": "2023-09-05T23:16:09.438000+00:00",
        "plannedTime": "2023-09-05T22:56:09.126000+00:00",
        "region": "NA",
        "viewersCount": 4,
        "encoder": "browser",
        "isBroadcasting": false,
        "title": "Forex Outlook.. Chart Time! FOREX UPDATE",
        "previewName": "FgaCmfs8ej_70OmUtkOIOM_LvfWGAECE.jpeg",
        "state": "ended",
        "streamingToken": null,
        "locale": "en",
        "viewsCount": 19,
      },
    },
    "channel": "tvlive.streams.general",
  },
};

export function messagepipews(req: Request) {
  const { socket: ws2, response } = Deno.upgradeWebSocket(req);
  ws2.onopen = () => {
    ws2.send(encode1(messagepipestr));
  };
  ws2.onmessage = (e) => {
  };
  ws2.onerror = (e) => {
    // console.log('ws2.onerror:', e);
    ws2.close();
  };
  ws2.onclose = () => {
    // console.log('ws2.onclose');
  };
  return response;
}



function encode1(jsonobj: object): string {
  const m = "~m~";
  const str = JSON.stringify(jsonobj);
  return m + str.length.toString() + m + str;
}

const step1 = {
  session_id: "<0.22546.597>_sfo-charts-35-webchart-1@sfo-compute-35_x",
  timestamp: 1693955629,
  timestampMs: 1693955629914,
  release: "registry.xtools.tv/tvbs_release/webchart:release_206-48",
  studies_metadata_hash: "3a66334a39b4becbab07e943b705b515bf1a4ac6",
  auth_scheme_vsn: 2,
  protocol: "json",
  via: "209.58.134.246:443",
  javastudies: ["3.61"],
};
