module.exports = {
    webpack: (config, { isServer }) => {
     
      if (!isServer) {
        config.resolve.fallback = {
          fs: false,
          path: false,
          os: false,
        };
      }
  
      return config;
    },
  };