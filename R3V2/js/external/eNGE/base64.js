((context) => {
  var encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
      decodings = {};
  encodings.split('').forEach((a,i) => decodings[a] = i);
  decodings['='] = 0;
  context.Base64 = {
    decode: (string) => {
      var length = string.length,
          byteLength = length / 4 * 3;
      if (string[length-2] === '=') --byteLength;
      if (string[length-1] === '=') --byteLength;
      let result = new ArrayBuffer(byteLength),
          buffer = new Uint8Array(result),
          bi = 0;
      for (let i = 0; i < length; i += 4) {
        const a = decodings[ string[i + 0] ],
              b = decodings[ string[i + 1] ],
              c = decodings[ string[i + 2] ],
              d = decodings[ string[i + 3] ],
              value = a << 18 | b << 12 | c << 6 | d;
        {
          buffer[bi + 0] = (value >> 16) & 255;
          buffer[bi + 1] = (value >> 8) & 255;
          buffer[bi + 2] = (value >> 0) & 255;
          bi += 3;
        }
      }
      buffer.length = byteLength;
      return result;
    },
    encode: (arrayBuffer) => {
      var base64        = '',
          bytes         = new Uint8Array(arrayBuffer),
          byteLength    = bytes.byteLength,
          byteRemainder = byteLength % 3,
          mainLength    = byteLength - byteRemainder,
          a, b, c, d, chunk;
      for (var i = 0; i < mainLength; i = i + 3){
        chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
        a = (chunk >> 18) & 63;
        b = (chunk >> 12) & 63;
        c = (chunk >>  6) & 63;
        d = (chunk >>  0) & 63;
        base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d];
      }
      if (byteRemainder == 1){
        chunk = bytes[mainLength];
        a = (chunk & 252) >> 2 // 252 = (2^6 - 1) << 2
        b = (chunk & 3)   << 4 // 3   = 2^2 - 1
        base64 += encodings[a] + encodings[b] + '==';
      }
      else if (byteRemainder == 2){
        chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1];
        a = (chunk & 64512) >> 10 // 64512 = (2^6 - 1) << 10
        b = (chunk & 1008)  >>  4 // 1008  = (2^6 - 1) << 4
        c = (chunk & 15)    <<  2 // 15    = 2^4 - 1
        base64 += encodings[a] + encodings[b] + encodings[c] + '=';
      }
      return base64;
    }
  }
})(window);
