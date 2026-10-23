import type { LocaleBundle } from '../bundle';
import core from './gu-core';
import pages from './gu-pages';

/** Gujarati UI copy. Loaded only when someone picks Gujarati (see loadLocale in ../core). */
const gu: LocaleBundle = { ...core, ...pages };
export default gu;
