const crypto = require("crypto");

// generates public link with expiration
function generatePublicLink(pageId, duration) {
  const expiresAt = Date.now() + duration * 60 * 1000;

  // hash created using pageId and expiration timestamp
  const hash = crypto
    .createHmac("sha256", process.env.SECRET_KEY)
    .update(`${pageId}:${expiresAt}`)
    .digest("hex");

  return `/share/${pageId}?expires=${expiresAt}&token=${hash}`;
}

// Verifies the public link is still valid
function verifyPublicLink(pageId, expires, token) {
  // Checks if public link is expired
  if (Date.now() > parseInt(expires, 10)) {
    return false;
  }

  // creates the hash again and compares it to the url token
  const expectedHash = crypto
    .createHmac("sha256", process.env.SECRET_KEY)
    .update(`${pageId}:${expires}`)
    .digest("hex");

  // using buffer to represent a fixed-length sequence of bytes, compares the token and hash and returns true or false
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expectedHash));
}

module.exports = {
  generatePublicLink,
  verifyPublicLink
};
