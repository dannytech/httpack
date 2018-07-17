import path from 'path'

import externals from 'webpack-node-externals'

export default {
  entry: {
    module: path.resolve(__dirname, 'lib', 'index.js')
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js'
  },
  devtool: 'source-map',
  target: 'node', // Ignore all node buildin modules in pack
  externals: [ externals() ], // Ignore all node_modules imports in pack
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [
          path.resolve(__dirname, 'lib')
        ],
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                [
                  'env',
                  {
                    targets: {
                      node: 'current'
                    }
                  }
                ]
              ],
              plugins: [
                'transform-runtime',
                'transform-async-to-generator'
              ]
            }
          }
        ]
      }
    ]
  }
}
