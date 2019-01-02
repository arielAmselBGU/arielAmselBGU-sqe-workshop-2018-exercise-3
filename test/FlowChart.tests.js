import assert from 'assert';
import {createFlowChartInfo} from '../src/js/FlowChart';


describe('Test createFlowChart',() => {
    it('is parsing an empty function correctly', () => {
        assert.deepEqual(
            (createFlowChartInfo('', [])),
            {}
        );
    });});

describe('Test createFlowChart',() => {
    it('test1', () => {
        assert.deepEqual(
            (createFlowChartInfo('let x =3; y = 3; let z =2;', [])),
            {code: 'let x =3; \n y = 3 \n let z =2;',
                color: true,
                falseBranch: undefined,
                num: 1,
                trueBranch:undefined,
                type: 2}
        );
    });});

describe('Test createFlowChart',() => {
    it('test2', () => {
        assert.deepEqual(
            (createFlowChartInfo('function t (x){ if (x<3) x = x+1; else x = x-1;}', [1])),
            { code: 'x<3',                color: true,                trueBranch:            { code: 'x = x+1',
                color: true,                trueBranch: { type: 3, num: 2, color: true },
                falseBranch: undefined,                num:3,                type: 2 },
            falseBranch:            { code: 'x = x-1',
                color: false,                trueBranch: { type: 3, num: 2, color: true },                falseBranch: undefined,
                num: 4,                type: 2 },                num: 1,
            type: 1 }        );
    });});

describe('Test createFlowChart',() => {
    it('test3', () => {
        assert.deepEqual(
            (createFlowChartInfo('function t (x){ if (x<3) x = x+1; else x = x-1;}', [50])),
            { code: 'x<3',                color: true,                trueBranch:                    { code: 'x = x+1',                        color: false,                        trueBranch: { type: 3, num: 2, color: true },                        falseBranch: undefined,                        num: 3,                        type: 2 },                falseBranch:                    { code: 'x = x-1',                        color: true,
                trueBranch: { type: 3, num: 2, color: true },                        falseBranch: undefined,                        num: 4,                        type: 2 },                num: 1,                type: 1 }                        );    });
    it('test4', () => {
        assert.deepEqual(
            (createFlowChartInfo('function t (x){ if (x<3) x = x+1;}', [50])),
            { code: 'x<3',                color: true,                trueBranch:
                    { code: 'x = x+1',                        color: false,                        trueBranch: { type: 3, num: 2, color: true },
                        falseBranch: undefined,                        num: 3,                        type: 2 },
            falseBranch: { type: 3, num: 2, color: true },            num: 1,
            type: 1 }

        );
    });

});

describe('Test createFlowChart',() => {
    it('test5', () => { assert.deepEqual(
        (createFlowChartInfo('while (true) {} let y = 5;', [4])),
        {type:3,num:2,color:true,trueBranch:
                {                    code: 'true',                    color:true,                    num:1,                    type:0,
                    trueBranch: {},                    falseBranch:{                        color:true,
                        num:3,                        type:3,                        trueBranch:{                            code:'let y = 5;',
                            color:true,                            falseBranch: undefined,
                            trueBranch: undefined,
                            num:4,
                            type:2
                        }
                    }
                }
        }
    );});});


describe('Test createFlowChart',() => {
    it('test6', () => { assert.deepEqual(
        (createFlowChartInfo('let x = 10; function f (x) {return x +1}', [50])),
        { code: 'let x = 10;',
            color: true,
            trueBranch:
                { code: 'return x +1',
                    color: true,
                    trueBranch: undefined,
                    falseBranch: undefined,
                    num: 2,
                    type: 6 },
            falseBranch: undefined,
            num: 1,
            type: 2 }
    );});});


describe('Test createFlowChart',() => {
    it('test7', () => { assert.deepEqual(
        (createFlowChartInfo('let x =3; if (x<3) x++;')),
        { code: 'let x =3;',
            color: true,            trueBranch:            { code: 'x<3',                color: true,
                trueBranch:                { code: 'x++',                    color: false,                    trueBranch: {
                    color: true,                        num:3,
                    type:3                    },                    falseBranch: undefined,
                num: 4,                    type: 2 },
                falseBranch: { type: 3, num: 3, color: true },                num: 2,
                type: 1 },            falseBranch: undefined,
            num: 1,            type: 2 }
    );});});

describe('Test createFlowChart',() => {
    it('test8', () => { assert.deepEqual(
        (createFlowChartInfo('let x =3; if (x<3) x++;',[10])),
        { code: 'let x =3;',            color: true,
            trueBranch:                { code: 'x<3',
                color: true,                    trueBranch:
                        { code: 'x++',                            color: false,
                            trueBranch: {                                color: true,
                                num:3,                                type:3
                            },                            falseBranch: undefined,
                            num: 4,                            type: 2 },
                falseBranch: { type: 3, num: 3, color: true },                    num: 2,
                type: 1 },            falseBranch: undefined,
            num: 1,            type: 2 }
    );});});


describe('Test createFlowChart',() => {
    it('test9', () => { assert.deepEqual(
        (createFlowChartInfo('function f (x) {if (x<10) x = 100; return x;}', [1])),
        { code: 'x<10',
            color: true,
            trueBranch:
                { code: 'x = 100',                    color: true,                    trueBranch: { type: 3, num: 2, color: true, trueBranch: {
                    code: 'return x;',
                    color:true,                            falseBranch:undefined,
                    trueBranch:undefined,                            num:4,
                    type:6                        }},                    falseBranch: undefined,                    num: 3,
                type: 2 },            falseBranch:
                { type: 3,                    num: 2,
                    color: true,                    trueBranch:
                        { code: 'return x;',                            color: true,                            trueBranch: undefined,                           falseBranch: undefined,                            num: 4,                            type: 6 } },
            num: 1,            type: 1 }
    );});});

describe('Test createFlowChart',() => {
    it('test10', () => { assert.deepEqual(
        (createFlowChartInfo('function f (x) {if (x<10) x = 100; return x;}', [50])),
        { code: 'x<10',            color: true,            trueBranch:
                { code: 'x = 100',                    color: false,                    trueBranch: { type: 3, num: 2, color: true, trueBranch: {
                    code: 'return x;',                        color:true,
                    falseBranch:undefined,                        trueBranch:undefined,
                    num:4,                        type:6                    }},
                falseBranch: undefined,                    num: 3,
                type: 2 },            falseBranch:                { type: 3,                    num: 2,
            color: true,                    trueBranch:
                        { code: 'return x;',                            color: true,
                            trueBranch: undefined,                            falseBranch: undefined,
                            num: 4,                            type: 6 } },
        num: 1,            type: 1 }
    );});});

/*

describe('Test createFlowChart',() => {
    it('test5', () => { assert.deepEqual(
        (createFlowChartInfo('function t (x){ if (x<3) x = x+1; else x = x-1;}', [50])),
        {}
    );});});
    */