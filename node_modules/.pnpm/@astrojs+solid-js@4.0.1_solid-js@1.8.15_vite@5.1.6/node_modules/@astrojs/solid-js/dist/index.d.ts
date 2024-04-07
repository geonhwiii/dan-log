import type { AstroIntegration } from 'astro';
import { type Options as ViteSolidPluginOptions } from 'vite-plugin-solid';
export type Options = Pick<ViteSolidPluginOptions, 'include' | 'exclude'>;
export default function (opts?: Options): AstroIntegration;
