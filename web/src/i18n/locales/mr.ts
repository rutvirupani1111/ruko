import type { LocaleBundle } from '../bundle';
import core from './mr-core';
import pages from './mr-pages';

/** Marathi UI copy. Loaded only when someone picks Marathi (see loadLocale in ../core). */
const mr: LocaleBundle = { ...core, ...pages };
export default mr;
