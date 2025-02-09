/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
      domains: ["your-project-id.supabase.co"],
      unoptimized: process.env.NODE_ENV === "development",
    },
  }
  
  module.exports = nextConfig
  
  