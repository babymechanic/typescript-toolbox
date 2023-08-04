import { ExtractByProp } from '../type-manipulation';

type ExtractStatus<TProp extends string, T extends { [K in TProp]: string }> = T[TProp];

export const createHandler = <TProp extends string, TDistributedUnion extends { [K in TProp]: string }, TReturn>(prop: TProp, handlers: {
    [K in ExtractStatus<TProp, TDistributedUnion>]: (val: ExtractByProp<TProp, K, TDistributedUnion>) => TReturn
}) => (value: TDistributedUnion) => {
    return handlers[value[prop]](value as ExtractByProp<TProp, TDistributedUnion[TProp], TDistributedUnion>);
};
