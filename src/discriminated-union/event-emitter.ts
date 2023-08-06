import { ExtractByProp } from '../type-manipulation';


type Event = {
    name: string;
}

export const eventEmitter = <TEvent extends Event>() => {

    const subscribers: Partial<{
        [K in TEvent['name']]: ((payload: ExtractByProp<'name', K, TEvent>) => Promise<void>)[]
    }> = {};

    return {
        on<TEventName extends TEvent['name']>(name: TEventName, callable: (payload: ExtractByProp<'name', TEventName, TEvent>) => Promise<void>): () => void {
            subscribers[name] = (subscribers[name] || []).concat(callable);
            return () => {
                subscribers[name] = (subscribers[name] || []).filter(x => x !== callable);
            }
        },
        async emit<TEventName extends TEvent['name']>(name: TEventName, payload: ExtractByProp<'name', TEventName, TEvent>): Promise<void> {
            await Promise.all((subscribers[name] || []).map(x => x(payload)))
        }
    }
}
