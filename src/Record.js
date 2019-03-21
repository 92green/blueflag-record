import del from 'unmutable/lib/delete';
import reduce from 'unmutable/lib/reduce';
import entries from 'unmutable/lib/entries';
import get from 'unmutable/lib/get';
import getIn from 'unmutable/lib/getIn';
import has from 'unmutable/lib/has';
import set from 'unmutable/lib/set';
import setIn from 'unmutable/lib/setIn';
import toObject from 'unmutable/lib/toObject';
import pipeWith from 'unmutable/lib/util/pipeWith';

export default function RecordFactory(notSetValues) {
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
                .keys(notSetValues)
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



        has = (key) => has(key)(this._data)

        get = (key, notSetValue) => get(key, notSetValue || get(key)(this._notSetValues))(this._data)

        getIn = (path, notSetValue) => getIn(path, notSetValue === undefined ? getIn(path)(this._notSetValues) : notSetValue)(this._data)

        set = (key, childValue) => this.unit(set(key, childValue)(this._data))

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
