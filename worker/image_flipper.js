const mod = (() => {
    let wasm;

    let cachedDecoder = new TextDecoder('utf-8');

    let cachegetUint8Memory = null;
    function getUint8Memory() {
            if (cachegetUint8Memory === null || cachegetUint8Memory.buffer !== wasm.memory.buffer) {
                        cachegetUint8Memory = new Uint8Array(wasm.memory.buffer);
                    }
            return cachegetUint8Memory;
        }

    let WASM_VECTOR_LEN = 0;

    function passArray8ToWasm(arg) {
            const ptr = wasm.__wbindgen_malloc(arg.length * 1);
            getUint8Memory().set(arg, ptr / 1);
            WASM_VECTOR_LEN = arg.length;
            return ptr;
        }

    function getArrayU8FromWasm(ptr, len) {
            return getUint8Memory().subarray(ptr / 1, ptr / 1 + len);
        }

    let cachedGlobalArgumentPtr = null;
    function globalArgumentPtr() {
            if (cachedGlobalArgumentPtr === null) {
                        cachedGlobalArgumentPtr = wasm.__wbindgen_global_argument_ptr();
                    }
            return cachedGlobalArgumentPtr;
        }

    let cachegetUint32Memory = null;
    function getUint32Memory() {
            if (cachegetUint32Memory === null || cachegetUint32Memory.buffer !== wasm.memory.buffer) {
                        cachegetUint32Memory = new Uint32Array(wasm.memory.buffer);
                    }
            return cachegetUint32Memory;
        }
    /**
     *     * @param {Uint8Array} arg0
     *         * @returns {Uint8Array}
     *             */
    function flip_image(arg0) {
            const ptr0 = passArray8ToWasm(arg0);
            const len0 = WASM_VECTOR_LEN;
            const retptr = globalArgumentPtr();
            try {
                        wasm.flip_image(retptr, ptr0, len0);
                        const mem = getUint32Memory();
                        const rustptr = mem[retptr / 4];
                        const rustlen = mem[retptr / 4 + 1];
                        if (rustptr === 0) return;
                        const realRet = getArrayU8FromWasm(rustptr, rustlen).slice();
                        wasm.__wbindgen_free(rustptr, rustlen * 1);
                        return realRet;


                    } finally {
                                wasm.__wbindgen_free(ptr0, len0 * 1);

                            }

        }

    const inst = new WebAssembly.Instance(flipper, {});
    wasm = inst.exports;

    return {
            flip_image,
        };

})();

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event))
})

async function handleRequest(event) {
    let cache = caches.default
    let request = event.request;

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
            var image = mod.flip_image(new Uint8Array(await src.arrayBuffer()));

            console.log('Got request', request);
            let resp = new Response(image, {status: 200});
            resp.headers.set('content-type', 'image/png');
            event.waitUntil(cache.put(request, resp.clone()))

            return resp;
        }
    return src
}

