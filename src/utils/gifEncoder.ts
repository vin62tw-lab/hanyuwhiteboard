/**
 * Lightweight pure JavaScript GIF89a encoder for Canvas frames
 */

export class SimpleGifEncoder {
  private width: number;
  private height: number;
  private delay: number; // in 1/100ths of a second
  private frames: ImageData[] = [];

  constructor(width: number, height: number, delayMs: number = 200) {
    this.width = width;
    this.height = height;
    this.delay = Math.round(delayMs / 10);
  }

  public addFrame(imageData: ImageData) {
    this.frames.push(imageData);
  }

  public encode(): Blob {
    const parts: Uint8Array[] = [];

    // Header GIF89a
    parts.push(new TextEncoder().encode('GIF89a'));

    // Logical Screen Descriptor
    const lsd = new Uint8Array(7);
    lsd[0] = this.width & 0xff;
    lsd[1] = (this.width >> 8) & 0xff;
    lsd[2] = this.height & 0xff;
    lsd[3] = (this.height >> 8) & 0xff;
    lsd[4] = 0xf7; // global color table flag + 256 colors
    lsd[5] = 0;    // background color index
    lsd[6] = 0;    // pixel aspect ratio
    parts.push(lsd);

    // Build standard 256-color palette (RGB)
    const palette = new Uint8Array(256 * 3);
    // 6x6x6 color cube = 216 colors
    let pIdx = 0;
    for (let r = 0; r < 6; r++) {
      for (let g = 0; g < 6; g++) {
        for (let b = 0; b < 6; b++) {
          palette[pIdx++] = Math.round(r * 51);
          palette[pIdx++] = Math.round(g * 51);
          palette[pIdx++] = Math.round(b * 51);
        }
      }
    }
    // remaining 40 grayscale levels
    for (let i = 0; i < 40; i++) {
      const gray = Math.round((i / 39) * 255);
      palette[pIdx++] = gray;
      palette[pIdx++] = gray;
      palette[pIdx++] = gray;
    }
    parts.push(palette);

    // Netscape application block for looping
    const appExt = new Uint8Array([
      0x21, 0xff, 0x0b,
      0x4e, 0x45, 0x54, 0x53, 0x43, 0x41, 0x50, 0x45, 0x32, 0x2e, 0x30, // NETSCAPE2.0
      0x03, 0x01, 0x00, 0x00, 0x00
    ]);
    parts.push(appExt);

    // Encode each frame
    for (const frame of this.frames) {
      // Graphics Control Extension
      const gce = new Uint8Array([
        0x21, 0xf9, 0x04,
        0x04, // disposal method: retain
        this.delay & 0xff,
        (this.delay >> 8) & 0xff,
        0x00, // transparent color index
        0x00
      ]);
      parts.push(gce);

      // Image Descriptor
      const id = new Uint8Array([
        0x2c,
        0x00, 0x00, 0x00, 0x00, // Left, Top
        this.width & 0xff,
        (this.width >> 8) & 0xff,
        this.height & 0xff,
        (this.height >> 8) & 0xff,
        0x00 // Local color table flag: none
      ]);
      parts.push(id);

      // Quantize ImageData pixels to 256 color indexes
      const pixelCount = this.width * this.height;
      const indexedPixels = new Uint8Array(pixelCount);
      const data = frame.data;

      for (let i = 0; i < pixelCount; i++) {
        const r = data[i * 4];
        const g = data[i * 4 + 1];
        const b = data[i * 4 + 2];
        // match 6x6x6 color cube
        const qr = Math.min(5, Math.round(r / 51));
        const qg = Math.min(5, Math.round(g / 51));
        const qb = Math.min(5, Math.round(b / 51));
        indexedPixels[i] = qr * 36 + qg * 6 + qb;
      }

      // LZW compression (minimum code size = 8 for 256 colors)
      const lzwData = this.lzwEncode(indexedPixels, 8);
      parts.push(lzwData);
    }

    // Trailer
    parts.push(new Uint8Array([0x3b]));

    return new Blob(parts, { type: 'image/gif' });
  }

  private lzwEncode(pixels: Uint8Array, minCodeSize: number): Uint8Array {
    const clearCode = 1 << minCodeSize; // 256
    const eoiCode = clearCode + 1;      // 257
    let codeSize = minCodeSize + 1;     // 9
    let nextCode = eoiCode + 1;

    const outBytes: number[] = [];
    let curAccum = 0;
    let curBits = 0;

    const writeBits = (code: number, bits: number) => {
      curAccum |= code << curBits;
      curBits += bits;
      while (curBits >= 8) {
        outBytes.push(curAccum & 0xff);
        curAccum >>= 8;
        curBits -= 8;
      }
    };

    // Dictionary using map
    let dict = new Map<string, number>();
    const resetDict = () => {
      dict.clear();
      codeSize = minCodeSize + 1;
      nextCode = eoiCode + 1;
    };

    writeBits(clearCode, codeSize);
    resetDict();

    let prefix = '';
    if (pixels.length > 0) {
      prefix = String.fromCharCode(pixels[0]);
    }

    for (let i = 1; i < pixels.length; i++) {
      const char = String.fromCharCode(pixels[i]);
      const combined = prefix + char;
      if (dict.has(combined)) {
        prefix = combined;
      } else {
        const code = prefix.length === 1 ? prefix.charCodeAt(0) : dict.get(prefix)!;
        writeBits(code, codeSize);

        if (nextCode < 4096) {
          dict.set(combined, nextCode++);
          if (nextCode === (1 << codeSize) && codeSize < 12) {
            codeSize++;
          }
        } else {
          writeBits(clearCode, codeSize);
          resetDict();
        }
        prefix = char;
      }
    }

    if (prefix.length > 0) {
      const code = prefix.length === 1 ? prefix.charCodeAt(0) : dict.get(prefix)!;
      writeBits(code, codeSize);
    }

    writeBits(eoiCode, codeSize);

    // Flush remaining bits
    if (curBits > 0) {
      outBytes.push(curAccum & 0xff);
    }

    // Packetize into blocks of max 254 bytes
    const result: number[] = [minCodeSize];
    let pos = 0;
    while (pos < outBytes.length) {
      const blockSize = Math.min(254, outBytes.length - pos);
      result.push(blockSize);
      for (let j = 0; j < blockSize; j++) {
        result.push(outBytes[pos + j]);
      }
      pos += blockSize;
    }
    result.push(0x00); // Block terminator

    return new Uint8Array(result);
  }
}
