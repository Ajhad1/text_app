const path = require('path')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const TranslationsPlugin = require('./webpack/translations-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = function (env = {}) {
  const config = {
    entry: {
      ticket_sidebar: [
        './src/javascript/ticket_sidebar.js',
        './src/ticket_sidebar.css'
      ]
    },

    mode: env.production ? 'production' : 'development',

    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, 'dist/assets')
    },

    // list of loaders to use for which files
    module: {
      rules: [
        {
          test: /\.js$/,
          use: { loader: 'babel-loader' }
        },
        {
          type: 'javascript/auto',
          test: /\.json$/,
          include: path.resolve(__dirname, './src/translations'),
          use: './webpack/translations-loader'
        },
        {
          test: /\.css$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              options: { publicPath: '../' }
            },
            'css-loader',
            'postcss-loader'
          ]
        },
        {
          test: /\.svg$/,
          use: { loader: 'raw-loader' }
        }
      ]
    },

    plugins: [
      // Empties the dist folder
      new CleanWebpackPlugin(['dist/*']),

      // Copy over some files
      new CopyWebpackPlugin([
        { from: 'src/manifest.json', to: '../', flatten: true },
        { from: 'src/images/*', to: '.', flatten: true },
        { from: 'src/ticket_sidebar.html', to: '.', flatten: true }
      ]),

      new MiniCssExtractPlugin({
        filename: '[name].css',
        chunkFilename: '[id].css'
      }),

      new TranslationsPlugin({
        path: path.resolve(__dirname, './src/translations')
      })
    ]
  }

  if (env.stats) {
    const Visualizer = require('webpack-visualizer-plugin')
    config.plugins.push(new Visualizer({
      filename: '../statistics.html'
    }))
  }

  return config
}
