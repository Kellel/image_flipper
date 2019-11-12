# Image Flipper

Why not write some rust that compiles into WASM that I run on workers that could be replaced with a single line of CSS?

## Notes

*Now correctly deals with type other than png!*

I also implemented animated GIF support, but in practice I haven't been able to prove that it works because I run out of CPU allocation before I can process more than a single frame.

## Running

```
wrangler preview
```
