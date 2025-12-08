// configs/imagekit.js
import ImageKit from "imagekit";

export function getImageKit() {
  // This constructor is synchronous and should only be used from server code.
  return new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY, // MUST be set in server env
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
  });
}
