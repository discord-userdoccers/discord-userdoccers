/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
	GOOGLE_SITE_VERIFICATION?: string;
}

declare global {
	interface Window {
		hasInitialized?: boolean;
	}
}

export type __dummyTypeDoNotUse = any;
