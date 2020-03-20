class Route {
	constructor(method, path, func) {
		this.method = method;
		this.path = path;
		this.func = func;
	}

	match(request) {
		if (request.method.toLowerCase() === this.method.toLowerCase()) {
			let url = new URL(request.url);
			return RegExp(this.path).test(url.pathname);
		}
		return false;
	}

	exec(request) {
		return this.func(request);
	}
}

class Router {
	constructor() {
		this.routes = [];
	}

	addRoute(method, path, func) {
		this.routes.push(new Route(method,path,func));
	}

	route(request) {
		for (let route of this.routes) {
			if (route.match(request)) {
				return route.exec(request)
			}
		}
		return new Response('resource not found', {
			status: 404,
			statusText: 'not found',
			headers: {
				'content-type': 'text/plain',
			},
		})
	}
}


addEventListener('fetch', event => {
	event.respondWith(handleRequest(event))
})

async function serveLandingPage() {
	// Get and return the landing page
	let page = await image_flipper_site.get('static/index.html')
	return new Response(page, {
		headers: {
			'content-type': 'text/html',
		}
	})
}

function guessType(url) {
	const htmlRegex = new RegExp("^.*\.html$");
	const cssRegex = new RegExp("^.*\.css$");
	const jsRegex = new RegExp("^.*\.js$");

	console.log(url);

	if (htmlRegex.test(url)) {
		return "text/html"
	}

	if (cssRegex.test(url)) {
		return "text/css"
	}

	if (jsRegex.test(url)) {
		return "text/javascript"
	}

	return "text/plain"
}

async function static(request) {
	// Get and return some static content
	let url = new URL(request.url)
	let item_name = url.pathname.substring(1) // /staic/
	let page = await image_flipper_site.get(item_name)

	// Figure out a mime tpye
	let mime = guessType(item_name);
	console.log(item_name, mime);

	if (page) {
	    return new Response(page, {
	    	headers: {
	    		'content-type': mime,
	    	}
	    })
	} else {
		return new Response('resource not found', {
			status: 404,
			statusText: 'not found',
			headers: {
				'content-type': 'text/plain',
			},
		})
	}
}

async function flip(request) {

	// Setup wasm
	const { flip_image, guess_content_type } = wasm_bindgen;
	await wasm_bindgen(wasm)


	// Fetch original asset
	let requested_path = new URL(request.url);
	let new_url = requested_path.pathname.substring(5)
	let new_request = new Request("https:/" + new_url);
	console.log(new_request);
	let src = await fetch(new_request);
	if (!src.ok) {
		console.log(src);
		return src;
	}

	// Flip
	var image_src = new Uint8Array(await src.arrayBuffer());
	var image = flip_image(image_src);
	var content_type = guess_content_type(image_src);

	console.log('Got request', request);
	let resp = new Response(image, {status: 200});
	resp.headers.set('content-type', content_type);

	// Toss it in the cache so it's fast in the future

	return resp;
}

async function handleRequest(event) {
	let request = event.request;

	// Just try and serve content from cache first
	//let cache = caches.default
	//let cache_data = await cache.match(request);
	//if (cache_data) {
	//	return src
	//}

	// Otherwise figure out what to do
	r = new Router()
	r.addRoute('GET', '^/$', serveLandingPage)
	r.addRoute('GET', '^/static/.*$', static)
	r.addRoute('GET', '^/flip/.*$', flip)

	const resp = await r.route(event.request)

	//event.waitUntil(cache.put(request, resp.clone()))
	return resp
}
