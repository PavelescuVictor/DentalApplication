module.exports = {
    chainWebpack: (config) => {
        const svgRule = config.module.rule("svg");

        svgRule.uses.clear();

        svgRule
            .use("babel-loader")
            .loader("babel-loader")
            .end()
            .use("vue-svg-loader")
            .loader("vue-svg-loader");
    },
    transpileDependencies: ["vuetify"],
    publicPath:
        // process.env.NODE_ENV === "production" ? "/DentalApplication/" : "/",
        process.env.NODE_ENV === "production" ? "/" : "/",
};
