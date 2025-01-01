import { NextResponse } from "next/server";

export function middleware(request) {
	const contentSecurityPolicyHeaderValue = getCSPHeaders();
	const requestHeaders = new Headers(request.headers);
	requestHeaders.set(
		"Content-Security-Policy",
		contentSecurityPolicyHeaderValue,
	);

	const response = NextResponse.next({
		request: {
			headers: requestHeaders,
		},
	});
	response.headers.set(
		"Content-Security-Policy",
		contentSecurityPolicyHeaderValue,
	);

	return response;
}

const google = `
                https://pay.google.com/ https://www.google.com/ https://www.google.com/pay https://www.google-analytics.com/ 
                https://fonts.googleapis.com/ https://analytics.google.com/ https://google.com/pay https://maps.googleapis.com/`;

function getCSPHeaders() {
	const cspHeader = `
    default-src 'self';
    script-src 'self' https://public.bankhapoalim.co.il ${google}
    https://cdn.glassix.net/
    https://www.googletagmanager.com https://www.google-analytics.com https://cdn.lr-intake.com ${google}
    https://googleads.g.doubleclick.net https://analytics.tiktok.com https://connect.facebook.net 
    https://static.hotjar.com https://websdk.appsflyer.com https://www.clarity.ms https://script.hotjar.com
    https://www.gstatic.com 'unsafe-eval' https://cdn.lr-intake.com 'unsafe-inline'
    https://cdn.scarabresearch.com https://static.scarabresearch.com;
    style-src 'self' 'unsafe-inline' ${google};
    font-src 'self' data: https://fonts.gstatic.com;
    object-src 'self' data:;
    base-uri 'self';
    img-src 'self' *.heilasystems.com data: https://www.facebook.com ${google}
    https://ad.doubleclick.net https://www.googletagmanager.com https://c.clarity.ms
    https://c.bing.com https://www.gstatic.com *.dominos.co.il https://cdn.glassix.com/ 
    https://maps.gstatic.com https://www.google.co.il/ https://cdn.aboohi.net/; 
    media-src 'self' *.heilasystems.com *.dominos.co.il data:;
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
    worker-src blob: data:;
    frame-src blob: data: https://*;
    connect-src 'self' *.heilasystems.com *.dominos.co.il https://r.lr-intake.com/ https://stats.g.doubleclick.net
    https://v.clarity.ms https://www.google-analytics.com https://analytics.tiktok.com
    ${google} https://q.clarity.ms https://gismap.map.co.il https://banner.appsflyer.com https://httpstat.us
    https://*.hotjar.io https://*.clarity.ms wss://*.heilasystems.com:* wss://*.dominos.co.il:* wss://ws.hotjar.com/
    https://recommender.scarabresearch.com https://webchannel-content.eservice.emarsys.net
    `;
	// Replace newline characters and spaces
	const contentSecurityPolicyHeaderValue = cspHeader
		.replace(/\s{2,}/g, " ")
		.trim();

	return contentSecurityPolicyHeaderValue;
}
