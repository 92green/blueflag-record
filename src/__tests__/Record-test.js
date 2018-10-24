//@flow
import clear from 'unmutable/lib/clear';
import clone from 'unmutable/lib/clone';
import count from 'unmutable/lib/count';
import del from 'unmutable/lib/delete';
import entries from 'unmutable/lib/entries';
import get from 'unmutable/lib/get';
import getIn from 'unmutable/lib/getIn';
import has from 'unmutable/lib/has';
import merge from 'unmutable/lib/merge';
import pipeWith from 'unmutable/lib/util/pipeWith';
import set from 'unmutable/lib/set';
import setIn from 'unmutable/lib/setIn';
import toObject from 'unmutable/lib/toObject';

import Record from '../Record';

const FooRecord = Record({
    foo: 'bar',
    baz: 'qux'
});

describe('constructing', () => {
    it('it will throw for foriegn keys', () => {
        const foo = new FooRecord({foo: 1});
        expect(() => foo.set('wrong', 2)).toThrow('Cannot create record with property "wrong". Must be one of foo, baz');
    });

    it('it will not throw for foriegn keys in fromUnknown', () => {
        expect(() => FooRecord.fromUnknown({not: 'cool'})).not.toThrow();
        expect(FooRecord.fromUnknown({baz: '!!!'}).baz).toBe('!!!');
    });

    it('will store notSetValues and data internally', () => {
        const foo = new FooRecord({foo: 2});
        expect(foo._data.foo).toBe(2);
        expect(foo._notSetValues.foo).toBe('bar');
    });

    it('can reconstruct itself via the unit function', () => {
        const foo = new FooRecord();
        expect(foo.unit()).not.toBe(foo);
    });

});

describe('getters', () => {

    it('supports the has function', () => {
        const foo = new FooRecord({foo: 2});
        expect(has('foo')(foo)).toBeTruthy();
    });

    it('supports the get function', () => {
        const foo = new FooRecord();
        expect(get('foo')(foo)).toBe('bar');
        expect(get('baz')(foo)).toBe('qux');
        expect(get('baz', 'custom')(foo)).toBe('custom');
    });

    it('supports the getIn function', () => {
        const foo = new FooRecord();
        expect(getIn(['foo'])(foo)).toBe('bar');
        expect(getIn(['bar'])(foo)).toBe(undefined);
        expect(getIn(['bar'], 'baz')(foo)).toBe('baz');
    });

    it('supports the entries function', () => {
        const foo = new FooRecord();
        const data = pipeWith(foo, entries(), data => [...data]);
        expect(data).toEqual([['foo', 'bar'], ['baz', 'qux']]);
    });

    it('supports the count function', () => {
        const foo = new FooRecord();
        expect(count()(foo)).toBe(2);
    });

    it('supports the toObject function', () => {
        const foo = new FooRecord({foo: 'radical'});
        const data = pipeWith(
            foo,
            toObject()
        );
        expect(data).toEqual({foo: 'radical', baz: 'qux'});
    });

});

describe('setters', () => {

    it('supports the set function', () => {
        const foo = new FooRecord();
        const untouched = JSON.stringify(foo);
        expect(set('foo', 'qux')(foo)._data.foo).toBe('qux');
        expect(JSON.stringify(foo)).toBe(untouched);
    });

    it('supports the setIn function', () => {
        const foo = new FooRecord();
        const untouched = JSON.stringify(foo);
        expect(setIn(['foo', 'bar'], 'qux')(foo)._data.foo.bar).toBe('qux');
        expect(JSON.stringify(foo)).toBe(untouched);
    });

    it('supports the delete function', () => {
        const foo = new FooRecord();
        const untouched = JSON.stringify(foo);
        expect(del('foo')(foo)._data.foo).toBe(undefined);
        expect(JSON.stringify(foo)).toBe(untouched);
    });

    it('supports the clear function', () => {
        const foo = new FooRecord({foo: 'radical'});
        const untouched = JSON.stringify(foo);
        const data = pipeWith(foo, clear(), get('foo'));
        expect(data).not.toBe('radical');
        expect(data).toBe('bar');
        expect(JSON.stringify(foo)).toBe(untouched);
    });


    it('supports the clone function', () => {
        const foo = new FooRecord({foo: 'radical'});
        const untouched = JSON.stringify(foo);
        const data = pipeWith(
            foo,
            clone()
        );
        expect(foo).not.toBe(data);
        expect(JSON.stringify(foo)).toBe(untouched);
    });

});




it('supports property accessors', () => {
    const foo = new FooRecord();
    expect(foo.baz).toBe('qux');
    expect(() => foo.baz = 'wrong!').toThrow('Record does not support property assignment.');
});

describe('merging', () => {
    it('it will merge data before default values', () => {
        const previous = new FooRecord({foo: 1});
        const next = new FooRecord({foo: 2});

        const merged = merge(next)(previous);
        expect(merged.foo).toBe(2);
        expect(merged.baz).toBe('qux');
    });
});
