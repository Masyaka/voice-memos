import { fork } from 'redux-saga/effects';

function getRegularSagas() {
  const req = require.context(
    './bundles',
    true,
    /^\.\/[a-z-]+\/sagas\/([a-z-]+)\.js$/i,
  );

  return req
    .keys()
    .map(key => [key, req(key)]);
}

export default function* root() {
  const childSagas = getRegularSagas();
  for (const childIndex in childSagas) {
    if (!childSagas.hasOwnProperty(childIndex)) continue;
    const saga = childSagas[childIndex];
    if (Array.isArray(saga[1].default)) {
      for (const domainSagaIndex in saga[1].default) {
        if (!saga[1].default.hasOwnProperty(domainSagaIndex)) continue;
        yield fork(saga[1].default[domainSagaIndex]);
      }
    } else {
      yield fork(saga[1].default);
    }
  }
}
