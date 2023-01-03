/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "amazon-clone-martstech.vercel.app",
      "i.dummyjson.com",
      "fakestoreapi.com",
      "firebasestorage.googleapis.com",
      "lh3.googleusercontent.com"
    ]
  },
  i18n: {
    locales: ["en-US", "pl-PL", "gb-GB", "fr-FR", "de-DE", "it-IT"],

    defaultLocale: "en-US",
  }
}

module.exports = nextConfig
