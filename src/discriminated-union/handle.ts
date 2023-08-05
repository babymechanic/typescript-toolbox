import { ExtractByProp } from '../type-manipulation';

type ExtractStatus<TProp extends string, T extends { [K in TProp]: string }> = T[TProp];

export const createHandler = <TProp extends string, TDiscriminatedUnion extends { [K in TProp]: string }, TReturn>(prop: TProp, handlers: {
    [K in ExtractStatus<TProp, TDiscriminatedUnion>]: (val: ExtractByProp<TProp, K, TDiscriminatedUnion>) => TReturn
}) => (value: TDiscriminatedUnion) => {
    return handlers[value[prop]](value as ExtractByProp<TProp, TDiscriminatedUnion[TProp], TDiscriminatedUnion>);
};
