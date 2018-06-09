function getRegularReducers() {
  const req = require.context(
    './bundles',
    true,
    /^\.\/[a-z-]+\/reducers\/([a-z-]+)\.js$/i,
  );

  return req
    .keys()
    .map(key => [key, req(key)]);
}

function getReducers() {
  return []
    .concat(getRegularReducers())
    .reduce((acc, [key, reducer]) => {
      const name = /^\.\/[a-z-]+\/reducers\/([a-z-]+)\.js$/i.exec(key)[1];

      if (acc[name]) {
        throw new Error(`Reducer "${name}" already exists, see "${key}"`);
      }

      acc[name] = reducer.default;

      return acc;
    }, {});
}

export default getReducers();
