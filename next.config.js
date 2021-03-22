const { nextI18NextRewrites } = require('next-i18next/rewrites')
const withImages = require('next-images')
const withCss = require('@zeit/next-css')
const withLess = require('@zeit/next-less')

const localeSubpaths = {}

module.exports = withCss(withLess(withImages({
    rewrites: async () => nextI18NextRewrites(localeSubpaths),
    publicRuntimeConfig: {
        localeSubpaths,
    },
    cssModules: true,
    webpack: function (config) {
        return config;
    }
})))
