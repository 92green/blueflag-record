//@flow
import has from 'unmutable/lib/has';
import get from 'unmutable/lib/get';
import getIn from 'unmutable/lib/getIn';
import set from 'unmutable/lib/set';
import setIn from 'unmutable/lib/setIn';
import del from 'unmutable/lib/delete';
import clear from 'unmutable/lib/clear';
import clone from 'unmutable/lib/clone';
import toObject from 'unmutable/lib/toObject';
import pipeWith from 'unmutable/lib/util/pipeWith';

import Record from '../Record';

const FooRecord = Record({
    foo: 'bar',
    baz: 'qux'
});

it('will store defaults and values internally', () => {
    const foo = new FooRecord({foo: 2});
    expect(foo._data.foo).toBe(2);
    expect(foo._defaults.foo).toBe('bar');
});

it('can reconstruct itself via the unit function', () => {
    const foo = new FooRecord();

});

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

it('supports the set function', () => {
    const foo = new FooRecord();
    expect(set('foo', 'qux')(foo)._data.foo).toBe('qux');
    expect(set('zoo', 'qux')(foo)._data.zoo).toBe('qux');
});

it('supports the setIn function', () => {
    const foo = new FooRecord();
    expect(setIn(['foo', 'bar'], 'qux')(foo)._data.foo.bar).toBe('qux');
});

it('supports the delete function', () => {
    const foo = new FooRecord();
    expect(del('foo')(foo)._data.foo).toBe(undefined);
});

it('supports the clear function', () => {
    const foo = new FooRecord({foo: 'radical'});
    const data = pipeWith(
        foo,
        clear(),
        get('foo')
    );
    expect(data).toBe('bar');
    expect(data).not.toBe('radical');
});

it('supports the clone function', () => {
    const foo = new FooRecord({foo: 'radical'});
    const data = pipeWith(
        foo,
        clone()
    );
    expect(foo).not.toBe(data);
});

it('supports the toObject function', () => {
    const foo = new FooRecord({foo: 'radical'});
    const data = pipeWith(
        foo,
        toObject()
    );
    expect(data).toBe(foo._data);
});
