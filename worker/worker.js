addEventListener('fetch', event => {
    event.respondWith(handleRequest(event))
})

async function handleRequest(event) {
    let cache = caches.default
    let request = event.request;
    const { flip_image } = wasm_bindgen;
    await wasm_bindgen(wasm)

    let src = await cache.match(request);
    if (!src) {
            let requested_path = new URL(request.url);
            let new_request = new Request("https:/" + requested_path.pathname);
            console.log(new_request);
            let src = await fetch(new_request);
            if (!src.ok) {
                        console.log(src);
                        return src;
                    }
            var image = flip_image(new Uint8Array(await src.arrayBuffer()));

            console.log('Got request', request);
            let resp = new Response(image, {status: 200});
            resp.headers.set('content-type', 'image/png');
            event.waitUntil(cache.put(request, resp.clone()))

            return resp;
        }
    return src
}
