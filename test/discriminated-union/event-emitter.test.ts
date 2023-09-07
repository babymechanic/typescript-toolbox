import { beforeEach, describe, expect, Mock, vi, it } from 'vitest';
import { createEventEmitter, EventEmitter } from '../../src/discriminated-union/event-emitter';
import { Equal, Expect } from '../test-utils/type-assertions';

type Event1 = { name: 'event1'; prop1: string; };
type Event2 = { name: 'event2'; prop2: number; };

describe('eventEmitter', () => {

    let eventEmitter: EventEmitter<Event1 | Event2>;
    let event1Subscriber: Mock;
    let event2Subscriber: Mock;
    let unsub1: () => void;

    beforeEach(() => {
        eventEmitter = createEventEmitter();
        event1Subscriber = vi.fn();
        event2Subscriber = vi.fn();
        unsub1 = eventEmitter.on('event1', event1Subscriber);
        eventEmitter.on('event2', event2Subscriber);
    })

    it('should emit events only for the emitted event', () => {
        const event: Event1 = { name: 'event1', prop1: 'hello' };
        eventEmitter.emit(event);

        expect(event1Subscriber).toHaveBeenCalledWith(event);
        expect(event2Subscriber).not.toHaveBeenCalled();
    });

    it('should not call unsubscribed listeners', () => {
        const event1: Event1 = { name: 'event1', prop1: 'hello' };
        const event2: Event2 = { name: 'event2', prop2: 238478293 };

        unsub1();
        eventEmitter.emit(event1);
        eventEmitter.emit(event2);

        expect(event1Subscriber).not.toHaveBeenCalled();
        expect(event2Subscriber).toHaveBeenCalledWith(event2);
    });

    it('should have correct typing for listeners', () => {
        eventEmitter.on('event1', async (args) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            type Cases = [Expect<Equal<typeof args, Event1>>]
        });
        eventEmitter.on('event2', async (args) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            type Cases = [Expect<Equal<typeof args, Event2>>]
        });
    });
});
