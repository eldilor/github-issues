const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WriteFilePlugin = require('write-file-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const fs = require('fs');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");


function generateViewsPlugins() {
  const viewsDir = './src/views';
  const views = fs.readdirSync(path.resolve(__dirname, viewsDir));
  const viewsPlugins = [];

  for (const view of views) {
    if (view) {
      const fileParts = view.split('.');
      const name = fileParts[0];
      const extension = fileParts[1];

      if (name && extension) {
        const config = {
          template: path.resolve(__dirname, `${viewsDir}/${view}`),
          minify: true,
          hash: true,
          alwaysWriteToDisk: true
        };

        if (name && name !== 'index') {
          config.filename = `${name}.html`;
        }

        viewsPlugins.push(new HtmlWebpackPlugin(config));
      }
    }
  }

  return viewsPlugins;
}

const viewsPlugins = generateViewsPlugins();

module.exports = (env, argv) => {
  const plugins = [
    new CleanWebpackPlugin(['dist'], {}),
    new MiniCssExtractPlugin({
      filename: "styles.css"
    }),
  ].concat(viewsPlugins).concat([
    new WriteFilePlugin()
  ]);

  if (argv.mode === 'production') {
    plugins.push(new OptimizeCSSAssetsPlugin({
      cssProcessorPluginOptions: {
        preset: ['default', {discardComments: {removeAll: true}}],
      }
    }));
  }

  return {
    entry: {
      main: './src/js/main.js'
    },

    output: {
      path: path.resolve(__dirname + '/dist'),
      filename: '[name].js',
      library: 'TD'
    },

    module: {
      rules: [
        {
          test: /\.scss$/,
          use: [
            'style-loader',
            MiniCssExtractPlugin.loader,
            'css-loader',
            'postcss-loader',
            'sass-loader'
          ],
        },
        {
          test: /\.js$/,
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env']
              ]
            }
          }
        },
        {
          test: /\.(gif|png|jpe?g|svg)$/i,
          use: [{
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'images/',
            }
          }],
        },
        {
          test: /\.twig$/,
          exclude: /(node_modules|bower_components)/,
          loader: 'twig-loader'
        },
        {
          test: /\.(woff(2)?|ttf|otf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
          use: [{
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'fonts/'
            }
          }]
        }
      ]
    },
    devtool: 'none',
    devServer: {
      host: 'localhost',
      port: 3001,
      stats: 'normal',
      open: true,
      clientLogLevel: 'none',
      compress: true,
      https: false,
      overlay: true
    },
    plugins: plugins,
  }
};