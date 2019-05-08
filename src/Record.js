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

const indentity = x => x;

export default function RecordFactory(config) {
    const keyConfig = map((vv) => (typeof vv === 'object') ? vv : {notSetValues: vv})(config);
    const notSetValues = map(vv => vv && vv.notSetValue || vv)(config);

    return class Record {
        constructor(data = {}) {
            this.__UNMUTABLE_COMPATIBLE__ = true;
            this._data = data;
            this._notSetValues = notSetValues;

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

        unit(data) {
            return new this.constructor(data);
        }

        toObject() {
            return {...this._notSetValues, ...this._data};
        }



        has = (key) => has(key)(this._notSetValues)

        get = (key, notFoundValue) => {
            const value = this._data[key];

            if(value !== undefined) {
                return (keyConfig[key].get || indentity)(value);
            }

            return notFoundValue || get(key)(this._notSetValues);
        }

        getIn = (path, notFoundValue) => getIn(path, notFoundValue === undefined ? getIn(path)(this._notSetValues) : notFoundValue)(this._data)

        set = (key, childValue) => {
            const value = getIn([key, 'set'], indentity)(keyConfig)(childValue);
            return this.unit(set(key, value)(this._data));
        }

        setIn = (path, childValue) => this.unit(setIn(path, childValue)(this._data))

        delete = (key) => this.unit(del(key)(this._data))

        entries = () => entries()(this.toObject())

        merge = (next) => this.unit({
            ...this._data,
            ...toObject()(next)
        })

        clear = () => this.unit({})

        clone = () => this.unit(this._data)

        count = () => [...this.entries()].length

    }
}
