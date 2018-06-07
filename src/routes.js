import React from 'react';

function getRegularRoutes() {
  const req = require.context(
    './bundles',
    true,
    /^\.\/[a-z\-]+\/routes\/([a-z\-]+)\.js$/i
  );

  return req
    .keys()
    .map(key => req(key).default);
}

export default getRegularRoutes();


