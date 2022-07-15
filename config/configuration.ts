export default () => ({
    NODE_ENV: process.env.NODE_ENV,
    port: parseInt(process.env.PORT, 10) || 3000,
    domain: {
        client: process.env.CLIENT_DOMAIN,
        api: process.env.API_DOMAIN,
    },
    database: {
        name: process.env.DATABASE_NAME,
        username: process.env.DATABASE_USERNAME,
        password: process.env.DATABASE_PASSWORD,
    },
    jwt: {
        secretToken: process.env.JWT_SECRET_TOKEN,
        refreshToken: process.env.JWT_REFRESH_TOKEN,
        accessToken: process.env.JWT_ACCESS_TOKEN,
        expiresIn: process.env.JWT_EXPIRES_IN,
    },
    google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
});
