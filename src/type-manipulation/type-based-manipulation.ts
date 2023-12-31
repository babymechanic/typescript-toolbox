export type ExtractByProp<
    TProp extends string,
    TVal extends string,
    TObj extends { [K in TProp]: string }
> = TObj extends { [K in TProp]: TVal } ? TObj : never;
type Merge<T extends { [TKey: string]: unknown }, U extends { [TKey: string]: unknown }> = {
    [K in ((keyof T) | (keyof U))]: K extends keyof T
        ? T[K]
        : K extends keyof U
            ? U[K]
            : never;
}
export type PartialExcept<T extends { [TKey: string]: unknown }, TRequired extends keyof T> = Merge<{
    [K in keyof T as K extends TRequired ? K : never]-?: NonNullable<T[K]>;
}, {
    [K in keyof T as K extends TRequired ? never : K]?: T[K];
}>;
export type DeepRequired<T> = T extends object ? { [K in keyof T]-?: DeepRequired<T[K]> } : NonNullable<T>;

export type ExtractLast<T extends unknown[]> = T extends [...unknown[], infer TLast] ? TLast : never;

export type AwaitedReturn<T> = T extends (...args: unknown[]) => unknown ? Awaited<ReturnType<T>> : never;
