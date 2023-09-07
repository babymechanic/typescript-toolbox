import { describe, expect, it } from 'vitest';
import { propsAreNotNull } from '../../src/assertions';
import { Equal, Expect } from '../test-utils/type-assertions';

type TestInput = {
    prop1?: string | undefined;
    prop2?: string | undefined;
}

describe('propsAreNotNull', () => {
    it('return true if all the expected props are not null', () => {
        const input: TestInput = { prop1: 'test 1', prop2: 'test 2' };

        expect(propsAreNotNull(input, ['prop1', 'prop2'])).toBe(true);
        expect(propsAreNotNull(input, ['prop1'])).toBe(true);
        expect(propsAreNotNull(input, ['prop2'])).toBe(true);
    });

    it('return false if any the expected props is null', () => {
        const input: TestInput = { prop1: 'test 1', prop2: undefined };

        expect(propsAreNotNull(input, ['prop2'])).toBe(false);
        expect(propsAreNotNull(input, ['prop1', 'prop2'])).toBe(false);
    });

    it('makes the checked props required when used as a type guard', () => {
        const input: TestInput = { prop1: 'test 1', prop2: undefined };

        if (propsAreNotNull(input, ['prop1'])) {

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            type Cases = [
                Expect<Equal<typeof input.prop1, string>>,
                Expect<Equal<typeof input.prop2, string | undefined>>
            ];
        }
    });
});
