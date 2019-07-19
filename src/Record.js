import del from 'unmutable/lib/delete';
import reduce from 'unmutable/lib/reduce';
import entries from 'unmutable/lib/entries';
import get from 'unmutable/lib/get';
import getIn from 'unmutable/lib/getIn';
import has from 'unmutable/lib/has';
import map from 'unmutable/lib/map';
import set from 'unmutable/lib/set';
import setIn from 'unmutable/lib/setIn';
import toObject from 'unmutable/lib/toObject';
import pipeWith from 'unmutable/lib/util/pipeWith';

const identity = x => x;
const nonEnumerable = (vv) => ({enumerable: false, value: vv});

export default function RecordFactory(config) {
    const keyConfig = map((vv) => (typeof vv === 'object') ? vv : {notSetValues: vv})(config);
    const notSetValues = map(vv => {
        if(typeof vv !== 'object') {
            return vv;
        }
        return get('notSetValue')(vv);
    })(config);

    return class Record {
        constructor(data = {}) {
            const setter = (key, value) => ((keyConfig[key] || {}).set || identity)(value);
            const getter = (key, value) => ((keyConfig[key] || {}).get || identity)(value, this._data);

            Object.defineProperties(this, {

                // Private values
                __UNMUTABLE_COMPATIBLE__: nonEnumerable(true),
                _data: nonEnumerable(data),
                _notSetValues: nonEnumerable(notSetValues),

                // Methods
                unit: nonEnumerable((data) => new this.constructor(data)),

                toObject: nonEnumerable(() => ({...this._notSetValues, ...this._data})),

                toJSON: nonEnumerable(() => this.toObject()),

                has: nonEnumerable((key) => has(key)(this._notSetValues)),

                get: nonEnumerable((key, notFoundValue) => {
                    notFoundValue = notFoundValue !== undefined
                        ? notFoundValue
                        : this._notSetValues[key];

                    let value = get(key, notFoundValue)(this._data);
                    return getter(key, value);
                }),

                getIn: nonEnumerable((path, notFoundValue) => getIn(path, notFoundValue === undefined ? getIn(path)(this._notSetValues) : notFoundValue)(this._data)),

                set: nonEnumerable((key, childValue) => {
                    const value = setter(key, childValue);
                    return this.unit(set(key, value)(this._data));
                }),

                setIn: nonEnumerable((path, childValue) => this.unit(setIn(path, childValue)(this._data))),

                delete: nonEnumerable((key) => this.unit(del(key)(this._data))),

                entries: nonEnumerable(() => entries()(this.toObject())),

                merge: nonEnumerable((next) => {
                    // prepare a function to run the new values through their setter
                    const updateValues = map((value, key) => setter(key, value));

                    return this.unit({
                        ...this._data,
                        ...updateValues(next._data || next) // only merge the data
                    });
                }),

                clear: nonEnumerable(() => this.unit({})),

                clone: nonEnumerable(() => this.unit(this._data)),

                count: nonEnumerable(() => [...this.entries()].length)
            });

            Object
                .keys(data)
                .forEach((key) => {
                    if(!notSetValues.hasOwnProperty(key)) {
                        throw new Error(`Cannot create record with property "${key}". Must be one of ${Object.keys(notSetValues).join(', ')}`);
                    }
                })

            Object
                .keys(keyConfig)
                .forEach((key) => {
                    Object.defineProperty(this, key, {
                        enumerable: true,
                        set: (value) => {
                            throw new Error(`Record does not support property assignment.`);
                        },
                        get: () => this.get(key)
                    });
                });

        }

        static fromUnknown(unknown) {
            return pipeWith(
                Object.keys(notSetValues),
                reduce((rr, key) => {
                    const value = get(key)(unknown);
                    if(value) {
                        return set(key, value)(rr);
                    }
                    return rr;
                }, {}),
                data => new this(data)
            );
        }

        // for printing records with console.log() in node
        inspect() {
            return `Record ${JSON.stringify(this.toObject(), null, 2)}`;
        }
    }
}
