extern crate cfg_if;
extern crate wasm_bindgen;
extern crate image;

mod utils;

use image::AnimationDecoder;
use std::io;
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

fn convert_image_type(input: image::ImageFormat) -> image::ImageOutputFormat {
    match input {
        image::ImageFormat::PNG  => image::ImageOutputFormat::PNG,
        image::ImageFormat::JPEG => image::ImageOutputFormat::PNG, // Bleh JPEG needs a quality
        image::ImageFormat::GIF  => image::ImageOutputFormat::GIF,
        image::ImageFormat::ICO  => image::ImageOutputFormat::ICO,
        image::ImageFormat::BMP  => image::ImageOutputFormat::BMP,
        _                        => image::ImageOutputFormat::PNG,
    }
}

#[wasm_bindgen]
pub fn guess_content_type(input: &[u8]) -> String {
    match image::guess_format(input).unwrap() {
        image::ImageFormat::PNG  => "image/png".to_string(),
        image::ImageFormat::JPEG => "image/png".to_string(),
        image::ImageFormat::GIF  => "image/gif".to_string(),
        image::ImageFormat::ICO  => "image/x-icon".to_string(),
        image::ImageFormat::BMP  => "image/bmp".to_string(),
        _                        => "image/png".to_string(),
    }
}

fn flip_gif(input: &[u8]) -> Box<[u8]> {
    let b = io::Cursor::new(input);
    let decoder = image::gif::Decoder::new(b).unwrap();
    let frames = decoder.into_frames();
    let mut frames = frames.collect_frames().unwrap();
    for frame in frames.iter_mut() {
        let frame_buffer = frame.clone();
        let dynamic = image::DynamicImage::ImageRgba8(frame_buffer.into_buffer());
        let output_buffer = dynamic.flipv().to_rgba();
        *frame = image::Frame::new(output_buffer);
    }

    let mut output = Vec::new();
    image::gif::Encoder::new(&mut output).encode_frames(frames).expect("Unable to write");
    return output.into_boxed_slice()
}

#[wasm_bindgen]
pub fn flip_image(input: &[u8]) -> Option<Box<[u8]>> {
    let input_format = image::guess_format(input).unwrap(); 


    let output_format = convert_image_type(input_format);

    if input_format == image::ImageFormat::GIF {
        return Some(flip_gif(input))
    }

    let img = image::load_from_memory_with_format(input, input_format).unwrap().flipv();

    let mut pixels = Vec::new();
    img.write_to(&mut pixels, output_format).expect("Unable to write");
    return Some(pixels.into_boxed_slice())
}
