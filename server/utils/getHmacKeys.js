const { createHmac } = require('crypto');

module.exports = function (secret_key) {
    // creating timestamp for rchl
    let timestamp = Date.now();
    timestamp = new Date(parseInt(timestamp));
    timestamp = timestamp.toISOString();

    // creating sha256 hash
    const hash = createHmac('sha256', `${secret_key}`)
        .update(timestamp)
        .digest('hex');

    return {
        rchl: timestamp,
        hash: hash
    };
};