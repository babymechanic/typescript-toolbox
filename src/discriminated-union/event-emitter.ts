import { ExtractByProp } from '../type-manipulation';

type Event = {
    readonly name: string;
}

export type EventEmitter<TEvent extends Event> = {
    on<T extends TEvent['name']>(name: T, callable: (payload: ExtractByProp<'name', T, TEvent>) => Promise<void>): () => void;
    emit<T extends TEvent>(payload: T): Promise<void>;
}

export const createEventEmitter = <TEvent extends Event>(): EventEmitter<TEvent> => {

    const subscribers: Partial<{
        [K in TEvent['name']]: ((payload: ExtractByProp<'name', K, TEvent>) => Promise<void>)[]
    }> = {};

    return {
        on<T extends TEvent['name']>(name: T, callable: (payload: ExtractByProp<'name', T, TEvent>) => Promise<void>): () => void {
            subscribers[name] = (subscribers[name] || []).concat(callable);
            return () => {
                subscribers[name] = (subscribers[name] || []).filter(x => x !== callable);
            }
        },
        async emit<const T extends TEvent>(payload: T): Promise<void> {
            const eventName = payload.name as TEvent['name'];
            type Payload<TEvent extends Event> = ExtractByProp<'name', typeof eventName, TEvent>;
            return Promise
                .all((subscribers[eventName] || []).map(x => x(payload as Payload<TEvent>)))
                .then();
        }
    }
}
