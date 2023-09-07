import { Equal, Expect } from '../test-utils/type-assertions';
import { describe, it } from 'vitest';
import {
    AwaitedReturn,
    DeepRequired,
    ExtractByProp,
    ExtractLast,
    PartialExcept
} from '../../src/type-manipulation';

describe('ExtractByProp', () => {

    it('should extract items based on the discriminator prop', () => {
        type Result = { status: 'success' } | { status: 'error' };

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        type Cases = [
            Expect<Equal<ExtractByProp<'status', 'success', Result>, { status: 'success' }>>,
            Expect<Equal<ExtractByProp<'status', 'error', Result>, { status: 'error' }>>,
        ]
    });

});

describe('PartialExcept', () => {
    it('should make everything optional but make the specified props mandatory', () => {
        type TestData = { optional?: string; mandatory: string; };

        type Created = PartialExcept<TestData, 'optional'>;

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        type Cases = [
            Expect<Equal<Created, { optional: string; mandatory: string | undefined; }>>
        ]

    });
});

describe('DeepRequired', () => {
    it('should make the entire object required recursively', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        type Cases = [Expect<Equal<
            DeepRequired<{ grandParent?: { parent?: { child?: string | undefined } } }>,
            { grandParent: { parent: { child: string } } }
        >>]

    });
});

describe('ExtractLast', () => {
    it('should extract the last type from an array', function () {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        type Cases = [
            Expect<Equal<ExtractLast<[string, number, Date]>, Date>>
        ];
    });
});


describe('AwaitedReturn', () => {
    it('gives never if not a function', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        type Cases = [
          Expect<Equal<AwaitedReturn<string>, never>>,
          Expect<Equal<AwaitedReturn<Record<string, unknown>>, never>>,
          Expect<Equal<AwaitedReturn<undefined>, never>>,
          Expect<Equal<AwaitedReturn<number>, never>>
        ];
    });

    it('gives the awaited return type', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        type Cases = [
            Expect<Equal<AwaitedReturn<() => Promise<string>>, string>>,
            Expect<Equal<AwaitedReturn<() => Promise<number>>, number>>,
            Expect<Equal<AwaitedReturn<() => Promise<Record<string, unknown>>>, Record<string, unknown>>>,
        ];
    });

    it('gives the return type for non promise types', function () {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        type Cases = [
            Expect<Equal<AwaitedReturn<() => string>, string>>,
            Expect<Equal<AwaitedReturn<() => number>, number>>,
            Expect<Equal<AwaitedReturn<() => Record<string, unknown>>, Record<string, unknown>>>,
        ];
    });
});
