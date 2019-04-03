extern crate cfg_if;
extern crate wasm_bindgen;
extern crate image;

mod utils;

use cfg_if::cfg_if;
use wasm_bindgen::prelude::*;

cfg_if! {
    // When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
    // allocator.
    if #[cfg(feature = "wee_alloc")] {
        extern crate wee_alloc;
        #[global_allocator]
        static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;
    }
}

#[wasm_bindgen]
pub fn flip_image(input: &[u8]) -> Option<Box<[u8]>> {
    let img = image::load_from_memory(input).unwrap().flipv();

    let mut pixels = Vec::new();
    img.write_to(&mut pixels, image::ImageOutputFormat::PNG).expect("Unable to write");
    return Some(pixels.into_boxed_slice())
}
