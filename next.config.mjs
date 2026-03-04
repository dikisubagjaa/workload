/** @type {import('next').NextConfig} */

import nextPWA from 'next-pwa';
import createNextJsObfuscator from 'nextjs-obfuscator';

const isDev = process.env.NODE_ENV !== 'production';
const enableAppPwa = String(process.env.NEXT_PUBLIC_ENABLE_APP_PWA || "").toLowerCase() === "true";

const obfuscatorOptions = {
    compact: true,
    controlFlowFlattening: false,
    controlFlowFlatteningThreshold: 0.75,
    deadCodeInjection: false,
    deadCodeInjectionThreshold: 0.4,
    debugProtection: false,
    debugProtectionInterval: 0,
    disableConsoleOutput: false,
    domainLock: [],
    domainLockRedirectUrl: 'about:blank',
    forceTransformStrings: [],
    identifierNamesCache: null,
    identifierNamesGenerator: 'hexadecimal',
    identifiersDictionary: [],
    identifiersPrefix: '',
    ignoreImports: false,
    inputFileName: '',
    log: false,
    numbersToExpressions: false,
    optionsPreset: 'default',
    renameGlobals: false,
    renameProperties: false,
    renamePropertiesMode: 'safe',
    reservedNames: [],
    reservedStrings: [],
    seed: 0,
    selfDefending: false,
    simplify: true,
    sourceMap: false,
    sourceMapBaseUrl: '',
    sourceMapFileName: '',
    sourceMapMode: 'separate',
    sourceMapSourcesMode: 'sources-content',
    splitStrings: false,
    splitStringsChunkLength: 10,
    stringArray: true,
    stringArrayCallsTransform: true,
    stringArrayCallsTransformThreshold: 0.5,
    stringArrayEncoding: [],
    stringArrayIndexesType: ['hexadecimal-number'],
    stringArrayIndexShift: true,
    stringArrayRotate: true,
    stringArrayShuffle: true,
    stringArrayWrappersCount: 1,
    stringArrayWrappersChainedCalls: true,
    stringArrayWrappersParametersMaxCount: 2,
    stringArrayWrappersType: 'variable',
    stringArrayThreshold: 0.75,
    target: 'browser',
    transformObjectKeys: false,
    unicodeEscapeSequence: false
};

const pluginOptions = {
    log: true,
    writeConfig: true,
    obfuscateFiles: {
        buildManifest: false,
        ssgManifest: true,
        webpack: true,
        additionalModules: ['es6-object-assign'],
    },
};

const nextConfig = {
    async headers() {
        return [
            {
                // cegah cache di semua route NextAuth
                source: "/api/auth/:path*",
                headers: [
                    { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, proxy-revalidate" },
                    { key: "Pragma", value: "no-cache" },
                    { key: "Expires", value: "0" },
                ],
            },
        ];
    },
    reactStrictMode: false,
    swcMinify: true,
    assetPrefix: process.env.NEXT_PUBLIC_ASSET_PREFIX || '',
    compiler: {
        styledComponents: true,
        removeConsole: isDev ? false : { exclude: ['error'] },
    },
    serverExternalPackages: ["pdfkit"],
    experimental: { 
        instrumentationHook: false,
        // ✅ safety net: pastikan data AFM pdfkit ikut ter-trace untuk route pdf
        outputFileTracingIncludes: {
            "src/app/api/appraisal/pdf/route.js": [
                "node_modules/pdfkit/js/data/**",
            ],
        },
     },
};

const runtimeCaching = [
    {
        urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
            cacheName: 'google-fonts',
            expiration: {
                maxEntries: 4,
                maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
            },
        },
    },
    {
        urlPattern: ({ url }) => {
            return url.pathname.startsWith('/_next/image');
        },
        handler: 'CacheFirst',
        options: {
            cacheName: 'next-images',
            expiration: {
                maxEntries: 20,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
            },
        },
    },
    {
        urlPattern: /^\/_next\/static\/chunks\/.*$/i,
        handler: 'CacheFirst',
        options: {
            cacheName: 'next-chunks',
            expiration: { maxEntries: 50, maxAgeSeconds: 30 * 24 * 60 * 60 },
        },
    },
    {
        urlPattern: /^\/_next\/static\/css\/.*$/i,
        handler: 'CacheFirst',
        options: {
            cacheName: 'next-css',
            expiration: { maxEntries: 20, maxAgeSeconds: 30 * 24 * 60 * 60 },
        },
    }
]

const withPWA = nextPWA({
    dest: 'public',
    // Default OFF in production to avoid Server Action mismatch from stale SW cache.
    // Enable explicitly with NEXT_PUBLIC_ENABLE_APP_PWA=true when needed.
    disable: isDev || !enableAppPwa,
    buildExcludes: ['app-build-manifest.json'],
    register: true,
    skipWaiting: true,
    runtimeCaching
});

const finalConfig = isDev
    ? withPWA(nextConfig)
    : withPWA(createNextJsObfuscator(nextConfig, obfuscatorOptions, pluginOptions));

export default finalConfig;
