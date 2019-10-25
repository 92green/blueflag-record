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
    baz: undefined
});

const DateRecord = Record({
    start: {
        notSetValue: '2000-01-01',
        get: value => new Date(value),
        set: value => value.getFullYear()
    }
});

const DerivedFieldsRecord = Record({
    name: undefined,
    nameLowercase: {
        notSetValue: undefined,
        get: (value, data) => data.name.toLowerCase()
    },
    dateOfBirth: {
        notSetValue: undefined,
        get: value => new Date(value),
        set: value => value.getFullYear()
    },
    dateOfBirthRaw: {
        notSetValue: undefined,
        get: (value, data) => data.dateOfBirth
    }
});

class ConstructedFieldsRecord extends Record({
    foo: undefined,
    bar: undefined
}) {
    constructor(data) {
        super({
            ...data,
            bar: data.foo + data.foo
        });
    }
};

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

describe('notSetValues', () => {
    it('will use the notSetValue key if given a getter/setter object', () => {
        class GetterSetter extends Record({
            foo: {
                notSetValue: 'bar'
            }
        }) {};

        expect((new GetterSetter({})).foo).toBe('bar');
    });

    it('will use the value if no getter/setter object is provided', () => {
        class Shorthand extends Record({
            un: undefined,
            nul: null,
            string: 'foo',
            number: 1,
            array: ['foo'],
            object: {foo: 'bar'},
            date: new Date('2001-01-01')
        }) {};

        const data = new Shorthand({});

        expect(data.un).toBe(undefined);
        expect(data.nul).toBe(null);
        expect(data.string).toBe('foo');
        expect(data.number).toBe(1);
        expect(data.array).toEqual(['foo']);
        expect(data.object).toEqual({foo: 'bar'});
        expect(data.date).toEqual(new Date('2001-01-01'));
    });
});

describe('getters', () => {

    it('supports the has function', () => {
        const foo = new FooRecord({foo: 2});
        expect(has('foo')(foo)).toBeTruthy();
        expect(has('baz')(foo)).toBeTruthy();
        expect(has('other')(foo)).toBeFalsy();
    });


    it('supports the get function', () => {
        const foo = new FooRecord();
        expect(get('foo')(foo)).toBe('bar');
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
        expect(data).toEqual([['foo', 'bar'], ['baz', undefined]]);
    });

    it('supports the count function', () => {
        const foo = new FooRecord();
        expect(count()(foo)).toBe(2);
    });

    it('supports the toObject function', () => {
        const foo = pipeWith(
            new FooRecord({foo: 'radical'}),
            toObject()
        );
        expect(foo).toEqual({foo: 'radical', baz: undefined});

        const derivedFields = pipeWith(
            new DerivedFieldsRecord({name: 'Mildred', dateOfBirth: '2000-01-01'}),
            toObject()
        )
        expect(derivedFields).toEqual({name: 'Mildred', dateOfBirth: '2000-01-01'});

    });

    it('will not apply getters to toObject', () => {
        expect(new DateRecord({}).toObject().start).toBe('2000-01-01');
    })

    it('allows falsey values to be got', () => {
        expect(new FooRecord({baz: false}).baz).toBe(false);
    });

    it('applies getter to the value', () => {
        const date = new DateRecord({start: '2001-01-01'});
        expect(date.start).toEqual(new Date('2001-01-01'));
    });

    it('applies getter to the notSetValue', () => {
        const date = new DateRecord({});
        expect(date.start).toEqual(new Date('2000-01-01'));
    });

    it('passes the data object as the getters second parameter', () => {
        const date = new DerivedFieldsRecord({name: 'Mildred'});
        expect(date.nameLowercase).toBe('mildred');
    });

    it('passes the data object without passing it through getters', () => {
        const date = new DerivedFieldsRecord({name: 'Mildred', dateOfBirth: '2000-01-01'});
        expect(date.dateOfBirth).toEqual(new Date('2000-01-01'));
        expect(date.dateOfBirthRaw).toBe('2000-01-01');
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

    it('applies config.set to the new value', () => {
        const date = new DateRecord({start: '2001-01-01'})
            .set('start', new Date('2222-01-01'));

        expect(date._data.start).toBe(2222);
    });

});




it('supports property accessors', () => {
    const foo = new FooRecord();
    expect(foo.foo).toBe('bar');
    expect(() => foo.baz = 'wrong!').toThrow('Record does not support property assignment.');
});

describe('merging', () => {
    it('will merge only data not default values', () => {
        const previous = new FooRecord({foo: 1, baz: 'qux'});
        const next = new FooRecord({foo: 2});

        const merged = merge(next)(previous);
        expect(merged.foo).toBe(2);
        expect(merged.baz).toBe('qux');
    });

    it('will parse new values through setters', () => {
        const previous = new DateRecord({});
        const next = new DateRecord({start: new Date('2001-01-01')});

        const merged = previous.merge({start: new Date('2001-01-01')});
        expect(merged._data.start).toBe(2001);
    });

    it('can merge records or objects', () => {
        const newData = {start: new Date('1984-01-01')};
        const previous = new DateRecord({});

        expect(previous.merge(newData)._data.start).toBe(1984);
        expect(previous.merge(new DateRecord({start: 1984}))._data.start).toBe(1984);

    });
});

describe('constructed fields', () => {
    it('will set field values during construction', () => {
        const record = new ConstructedFieldsRecord({foo: 'hello'});
        expect(record.foo).toBe('hello');
        expect(record.bar).toBe('hellohello');

        const recordAfterSet = record.set('foo', 'hi');
        expect(recordAfterSet.foo).toBe('hi');
        expect(recordAfterSet.bar).toBe('hihi');
    });

});

describe('printing to console', () => {
    it('it will return a string of record contents when inspect() is called', () => {
        const foo = new FooRecord({foo: 1});
        expect(foo.inspect()).toBe('Record {\n  "foo": 1\n}');
    });

});
