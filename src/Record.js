//@flow
import has from 'unmutable/lib/has';
import get from 'unmutable/lib/get';
import getIn from 'unmutable/lib/getIn';
import set from 'unmutable/lib/set';
import setIn from 'unmutable/lib/setIn';
import del from 'unmutable/lib/delete';

export default function RecordFactory(defaults: *) {
    return class Record {
        _data: *;
        _defaults: *;
        __UNMUTABLE_COMPATIBLE__: boolean;

        constructor(data: * = {}) {
            this.__UNMUTABLE_COMPATIBLE__ = true;
            this._data = data;
            this._defaults = defaults;
        }

        unit(data: *) {
            return new this.constructor(data);
        }

        has = (key: string) => has(key)(this._data)

        get = (key: string, notSetValue: *): * => get(key, notSetValue || get(key)(this._defaults))(this._data)

        getIn = (path: string[], notSetValue: *): * => getIn(path, notSetValue || getIn(path)(this._defaults))(this._data)

        set = (key: string, childValue: *): Record => this.unit(set(key, childValue)(this._data))

        setIn = (path: string[], childValue: *): Record => this.unit(setIn(path, childValue)(this._data))

        delete = (key: string): Record => this.unit(del(key)(this._data))

        clear = (): Record => this.unit({})

        clone = (): Record => this.unit(this._data);

        toObject = (): * => this._data;
    }
}
