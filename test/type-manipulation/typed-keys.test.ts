import { describe, expect, it } from 'vitest';
import { typedKeys } from '../../src/type-manipulation';
import { Equal, Expect } from '../test-utils/type-assertions';

describe('typedKeys', () => {
    it('should return all the keys on the object', () => {
        const keys = typedKeys({ prop1: 'test', prop2: 'test' });

        expect(keys).toEqual(['prop1', 'prop2']);
    });

    it('should be a typed  array', () => {
        const keys = typedKeys({ prop1: 'test', prop2: 'test' });

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        type Cases = [
            Expect<Equal<typeof keys, ('prop1' | 'prop2')[]>>
        ]
    });
});
