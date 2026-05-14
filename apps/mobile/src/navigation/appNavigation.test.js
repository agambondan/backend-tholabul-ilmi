const assert = require('node:assert/strict');
const test = require('node:test');
const {
  closeInternalViewThenOpenTabState,
  hardwareBackState,
  openInternalViewState,
} = require('./appNavigation');

const makeId = (tab, suffix) => `test:${tab}:${suffix}`;
const directoryRoute = { tab: 'home', view: 'feature-directory' };
const initialState = () => ({
  activeTab: 'home',
  deepLinkTarget: null,
  internalRoutes: {},
  returnRoutes: {},
});

const openFeatureDirectory = (state = initialState()) =>
  openInternalViewState(state, 'home', 'feature-directory', {}, makeId).state;

test('feature from homepage directory returns to directory, then homepage', () => {
  let state = openFeatureDirectory();
  state = closeInternalViewThenOpenTabState(state, 'home', 'belajar', { featureKey: 'doa', returnTo: directoryRoute }, makeId).state;

  assert.equal(state.activeTab, 'belajar');
  assert.deepEqual(state.returnRoutes.belajar, directoryRoute);

  state = openInternalViewState(state, directoryRoute.tab, directoryRoute.view, { returnTab: null }, makeId).state;

  assert.equal(state.activeTab, 'home');
  assert.equal(state.internalRoutes.home?.view, 'feature-directory');

  const backResult = hardwareBackState(state, makeId);

  assert.equal(backResult.handled, true);
  assert.equal(backResult.state.activeTab, 'home');
  assert.equal(backResult.state.internalRoutes.home, undefined);
});

test('tab opened from homepage directory returns to directory before homepage', () => {
  let state = openFeatureDirectory();
  state = closeInternalViewThenOpenTabState(state, 'home', 'quran', { returnTo: directoryRoute }, makeId).state;

  assert.equal(state.activeTab, 'quran');
  assert.deepEqual(state.returnRoutes.quran, directoryRoute);

  let backResult = hardwareBackState(state, makeId);

  assert.equal(backResult.handled, true);
  assert.equal(backResult.state.activeTab, 'home');
  assert.equal(backResult.state.internalRoutes.home?.view, 'feature-directory');

  backResult = hardwareBackState(backResult.state, makeId);

  assert.equal(backResult.handled, true);
  assert.equal(backResult.state.activeTab, 'home');
  assert.equal(backResult.state.internalRoutes.home, undefined);
});

test('internal view opened from homepage directory returns to directory before homepage', () => {
  let state = openFeatureDirectory();
  state = closeInternalViewThenOpenTabState(state, 'home', 'ibadah', { returnTo: directoryRoute, view: 'qibla' }, makeId).state;

  assert.equal(state.activeTab, 'ibadah');
  assert.equal(state.internalRoutes.ibadah?.view, 'qibla');
  assert.deepEqual(state.internalRoutes.ibadah?.returnTo, directoryRoute);

  let backResult = hardwareBackState(state, makeId);

  assert.equal(backResult.handled, true);
  assert.equal(backResult.state.activeTab, 'home');
  assert.equal(backResult.state.internalRoutes.home?.view, 'feature-directory');

  backResult = hardwareBackState(backResult.state, makeId);

  assert.equal(backResult.handled, true);
  assert.equal(backResult.state.activeTab, 'home');
  assert.equal(backResult.state.internalRoutes.home, undefined);
});
