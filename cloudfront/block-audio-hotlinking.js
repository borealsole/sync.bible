// CloudFront Function (cloudfront-js-2.0, viewer request) for the audio
// distribution. Stops other websites from embedding our audio files, so we
// don't pay for their listeners.
//
// Browsers send a Referer header naming the page that requested the audio.
// Requests from sync.bible (and local development) are allowed. Requests with
// no Referer are also allowed: some browsers and privacy tools strip it, and
// our own scripts don't send one. This blocks casual embedding, not
// determined scrapers, who can fake the header.
//
// Deploy changes with: aws cloudfront update-function, then publish-function.

var ALLOWED_HOSTS = [ 'sync.bible', 'www.sync.bible', 'localhost', '127.0.0.1' ];

// CloudFront calls handler, so it looks unused here.
// eslint-disable-next-line no-unused-vars
function handler( event ) {
	var request = event.request;
	var referer = request.headers.referer;

	if ( ! referer || ! referer.value ) {
		return request;
	}

	var match = referer.value.match( /^https?:\/\/([^/:?#]+)/i );
	var host = match ? match[ 1 ].toLowerCase() : '';

	if ( ALLOWED_HOSTS.indexOf( host ) !== -1 ) {
		return request;
	}

	return {
		statusCode: 403,
		statusDescription: 'Forbidden',
		headers: { 'cache-control': { value: 'no-store' } },
	};
}
