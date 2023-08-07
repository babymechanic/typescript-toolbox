import { ExtractByProp } from '../type-manipulation';

type ExtractStatus<TProp extends string, T extends { [K in TProp]: string }> = T[TProp];

type Handlers<TProp extends string, TDiscriminatedUnion extends { [K in TProp]: string }, TReturn> = {
    [K in ExtractStatus<TProp, TDiscriminatedUnion>]: (val: ExtractByProp<TProp, K, TDiscriminatedUnion>) => TReturn
};

export const createHandler = <
    TProp extends string,
    TDiscriminatedUnion extends { [K in TProp]: string },
    TReturn
>(prop: TProp, handlers: Handlers<TProp, TDiscriminatedUnion, TReturn>) => (value: TDiscriminatedUnion): TReturn => {
    return handlers[value[prop]](value as ExtractByProp<TProp, TDiscriminatedUnion[TProp], TDiscriminatedUnion>);
};
