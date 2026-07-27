const VIDEO_PATTERN = /\.mp4(?:$|[?#])/i;
const GIF_PATTERN = /\.gif(?:$|[?#])/i;
const STATIC_COVER_PATTERN = /\.(?:jpe?g|png|webp|avif)(?:$|[?#])/i;

export function mediaSource(media) {
  return typeof media === "string" ? media : media?.src || "";
}

export function isVideoMedia(media) {
  return media?.type === "video" || VIDEO_PATTERN.test(mediaSource(media));
}

export function isGifMedia(media) {
  return media?.type === "gif" || GIF_PATTERN.test(mediaSource(media));
}

export function isStaticCoverMedia(media) {
  return media?.type === "image" || STATIC_COVER_PATTERN.test(mediaSource(media));
}
