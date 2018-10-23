//@flow
import merge from 'webpack-merge';
import config from './config';

// @intent configure the extend function like a hoc
// I wanted Config but that was taken by the config file
type Options = {
    name: string,
    mode: 'production' | 'development'
};

/*
 * @intent
 * Extend the default config via the function provided to extend
 */
export default function extend(options: Options): * {
    return (customConfig: *) => merge(config(options), customConfig);
}
