// const chalk = require("chalk");
const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const autoprefixer = require("autoprefixer");
const nesting = require("postcss-nesting");

module.exports = function(env) {
  const isDev = env === "development";

  const toAppend = isDev
    ? []
    : [new CleanWebpackPlugin([path.resolve(__dirname, "build/**.**")]),
        new webpack.optimize.UglifyJsPlugin({
          compress: {
            warnings: false,
            drop_console: true,
            dead_code: true,
            unused: true,
          },
          mangle: false,
          comments: false,
        }),
      ];

  return {
    context: path.resolve(__dirname, "src"),
    entry: {
      "home": "./home.js",
      "about": "./about.js",
    },
    output: {
      filename: isDev
        ? "[name].js"
        : "[name]_[hash:5].js",
      path: path.resolve(__dirname, "build"),
      // publicPath: "//cdn.example.com/"
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          include: path.resolve(__dirname, "src"),
          use: ExtractTextPlugin.extract({
            fallback: "style-loader",
            use: [
              {
                loader: "css-loader",
                options: { importLoaders: 1 }
              },
              {
                loader: "postcss-loader",
                options: { plugins: [autoprefixer, nesting] }
              }
            ]
          })
        },
        {
          test: /\.js$/,
          include: path.resolve(__dirname, "src"),
          use: [
            {
              loader: "babel-loader",
              options: { presets: ["react", "env"] }
            }
          ]
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        title: "Home",
        template: "template.html",
        filename: "home.html",
        excludeChunks: ["about"],
      }),
      new HtmlWebpackPlugin({
        title: "About",
        template: "template.html",
        filename: "about.html",
        excludeChunks: ["home"],
      }),
      new ExtractTextPlugin({
        filename: isDev
          ? "[name].css"
          : "[name]_[hash:5].css",
      }),
      // new webpack.optimize.CommonsChunkPlugin({ name: ["commons"] }),
      new webpack.optimize.CommonsChunkPlugin({
        name: "commons",
        minChunks: function(m, cnt) {
          return m.context && m.context.includes("node_modules");
        },
        // minChunks: 2
      }),
      new webpack.optimize.CommonsChunkPlugin({
        name:["bootstrap"],
        minChunks: (m, cnt) => !m.context
      }),
    ].concat(toAppend),
  }
}
