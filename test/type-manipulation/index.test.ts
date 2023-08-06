import { DeepRequired, ExtractByProp, ExtractLast, PartialExcept } from '../../src/type-manipulation';
import { Equal, Expect } from '../test-utils/type-assertions';
import { describe, it } from 'vitest';

describe('ExtractByProp', () => {

    it('should extract items based on the discriminator prop', () => {
        type Result = { status: 'success' } | { status: 'error' };

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

        type Cases = [
            Expect<Equal<Created, { optional: string; mandatory: string | undefined; }>>
        ]

    });
});

describe('DeepRequired', () => {
    it('should make the entire object required recursively', () => {
        type Cases = [Expect<Equal<
            DeepRequired<{ grandParent?: { parent?: { child?: string | undefined } } }>,
            { grandParent: { parent: { child: string } } }
        >>]

    });
});

describe('ExtractLast', () => {
    it('should extract the last type from an array', function () {
        type Cases = [
            Expect<Equal<ExtractLast<[string, number, Date]>, Date>>
        ];
    });
});

