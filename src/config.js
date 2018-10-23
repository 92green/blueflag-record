//@flow

/*
 * @intent
 * The most common use cases of webpack. Not the simple but the common.
 * People can override if they dont like the common cases.
 */
import path from 'path';
import webpack from 'webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CleanWebpackPlugin from 'clean-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import autoprefixer from 'autoprefixer';

// @INTENT: use babel on js/jsx files
const JS_LOADER = {
    test: /\.jsx?$/,
    include: path.resolve('./src'),
    use: {
        loader: 'babel-loader',
        options: {
            cacheDirectory: true
        }
    }
};

// @INTENT: load graphql files raw style
const GRAPHQL_LOADER = {
    test: /\.graphql$/,
    include: path.resolve('./src'),
    use: 'raw-loader'
};

const FILE_LOADER = {
    test: /\.(png|svg|jpg|gif|ttf|woff|woff2|eot|otf|ico)$/,
    include: path.resolve('./src'),
    use: {
        loader: 'file-loader',
        options: {
            name: 'assets/[hash].[ext]'
        }
    }
};

const POSTCSS_USE_ENTRY = {
    loader: 'postcss-loader',
    options: {
        ident: 'postcss',
        sourceMap: true,
        plugins: () => [
            autoprefixer({browsers: ['ie >= 9', 'last 2 versions']})
        ]
    }
};

const CSS_DEV_LOADER = {
    test: /\.scss?$/,
    include: path.resolve('./src'),
    use: [
        {
            loader: 'style-loader',
            options: {
                sourceMap: true,
                convertToAbsoluteUrls: true
            }
        },
        'css-loader?sourceMap',
        POSTCSS_USE_ENTRY,
        'sass-loader?sourceMap'
    ]
};

const CSS_PROD_LOADER = {
    test: /\.scss?$/,
    include: path.resolve('./src'),
    use: [
        {
            loader: MiniCssExtractPlugin.loader
        },
        'css-loader',
        POSTCSS_USE_ENTRY,
        'sass-loader'
    ]
};


export default function config({name, mode, dirname}: *): * {
    const production = mode === 'production';
    const src = path.join(dirname, 'src');
    const build = path.join(dirname, 'build');
    return {
        cache: production,
        devtool: production ? 'source-map' : undefined,
        entry: {
            [name]: path.join(src, 'index.js')
        },
        output: {
            path: build,
            filename: '[name]-[hash].js',
            chunkFilename: '[id]-[chunkhash].js',
            publicPath: '/'
        },
        resolve: {
            alias: {
                ['~']: src
            },
            extensions: ['.jsx', '.js']
        },
        plugins: [
            new CleanWebpackPlugin(['build']),
            new webpack.IgnorePlugin(/\.flow$/),
            new HtmlWebpackPlugin({
                template: 'src/index.static.jsx'
            }),
            !production && new MiniCssExtractPlugin({
                filename: `[name]-[hash].css`
            })

        ].filter(Boolean),
        module: {
            rules: [
                JS_LOADER,
                GRAPHQL_LOADER,
                FILE_LOADER,
                production ? CSS_PROD_LOADER : CSS_DEV_LOADER
            ]
        },
        devServer: {
            host: process.env.HOST || '0.0.0.0',
            port: process.env.PORT || 3000,
            publicPath: '/',
            hot: true,
            stats: 'minimal',
            historyApiFallback: true
        }
    };
}
