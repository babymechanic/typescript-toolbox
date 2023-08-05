import { DeepRequired, ExtractByProp, PartialExcept } from '../../src/type-manipulation';
import { Equal, Expect } from '../test-utils/type-assertions';
import { describe } from 'vitest';


describe('ExtractByProp', () => {
    type Result = { status: 'success' } | { status: 'error' };

    type Cases = [
        Expect<Equal<ExtractByProp<'status', 'success', Result>, { status: 'success' }>>,
        Expect<Equal<ExtractByProp<'status', 'error', Result>, { status: 'error' }>>,
    ]
});

describe('PartialExcept', () => {

    type TestData = { optional?: string; mandatory: string; };

    type Created = PartialExcept<TestData, 'optional'>;

    type Cases = [
        Expect<Equal<Created, { optional: string; mandatory: string | undefined; }>>
    ]
});

describe('DeepRequired', () => {
    type Cases = [Expect<Equal<
        DeepRequired<{ grandParent?: { parent?: { child?: string } } }>,
        { grandParent: { parent: { child: string } } }
    >>]
});



