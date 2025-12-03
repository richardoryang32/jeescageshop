/** @type {import('@prisma/internals').Config} */
const config = {
  datasources: {
    db: {
      url: {
        fromEnvVar: "DATABASE_URL",
      },
    },
  },
};

module.exports = config;
