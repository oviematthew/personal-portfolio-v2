// Can this browser play WebM video? Safari older than 14.1 (and some iOS versions) cannot, so callers fall
// back to the animated GIF.
export function canPlayWebm() {
  if (typeof document === "undefined") return true;
  const v = document.createElement("video");
  return !!v.canPlayType && v.canPlayType('video/webm; codecs="vp8"') !== "";
}
