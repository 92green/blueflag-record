//@flow
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

export default function RecordFactory(notSetValues: *) {
    return class Record {
        _data: *;
        _notSetValues: *;
        __UNMUTABLE_COMPATIBLE__: boolean;

        constructor(data: * = {}) {
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

        static fromUnknown(unknown: *): * {
            return pipeWith(
                Object.keys(notSetValues),
                reduce((rr, ii, key) => {
                    const value = get(key)(unknown);
                    if(value) {
                        return set(key)(rr);
                    }
                    return rr;
                }, {}),
                data => new Record(data)
            );
        }

        unit(data: *) {
            return new this.constructor(data);
        }



        has = (key: string) => has(key)(this._data)

        get = (key: string, notSetValue: *): * => get(key, notSetValue || get(key)(this._notSetValues))(this._data)

        getIn = (path: string[], notSetValue: *): * => getIn(path, notSetValue === undefined ? getIn(path)(this._notSetValues) : notSetValue)(this._data)

        set = (key: string, childValue: *): Record => this.unit(set(key, childValue)(this._data))

        setIn = (path: string[], childValue: *): Record => this.unit(setIn(path, childValue)(this._data))

        delete = (key: string): Record => this.unit(del(key)(this._data))

        entries = () => entries()({...this._notSetValues, ...this._data})

        merge = (next: *) => this.unit({
            ...this._data,
            ...toObject()(next)
        })

        clear = (): Record => this.unit({})

        clone = (): Record => this.unit(this._data)

        count = () => [...this.entries()].length

        toObject = (): * => this._data;
    }
}
