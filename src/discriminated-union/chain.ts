import { ExtractLast } from '../type-manipulation';

type DUnion<TDiscriminatorProp extends string> = { [K: string]: unknown } & { [K in TDiscriminatorProp]: unknown; };

type Callable<TOutputAcc extends unknown[], TDiscriminatorProp extends string> = TOutputAcc['length'] extends 0
    ? () => Promise<DUnion<TDiscriminatorProp>>
    : (input: ExtractLast<TOutputAcc>, previousOutputs: TOutputAcc) => Promise<DUnion<TDiscriminatorProp>>;

type ChainRunner<
    TDiscriminatorProp extends string,
    TEscapeType extends DUnion<TDiscriminatorProp>,
    TOutputAcc extends unknown[],
> = {
    link: <T extends Callable<TOutputAcc, TDiscriminatorProp>>(callable: T) => ChainRunner<
        TDiscriminatorProp,
        TEscapeType,
        [...TOutputAcc, Exclude<Awaited<ReturnType<T>>, TEscapeType>]
    >;
    run: () => Promise<TEscapeType | ExtractLast<TOutputAcc>>;
}

const createChainRunner = <
    TDiscriminatorProp extends string,
    TEscapeType extends DUnion<TDiscriminatorProp>,
    TOutputAcc extends unknown[],
>(
    discriminatorProp: string,
    isEscape: (val: DUnion<TDiscriminatorProp>) => val is TEscapeType,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    callChain: ReadonlyArray<(...args: any[]) => Promise<unknown>>) => {
    return {
        link<T extends Callable<TOutputAcc, TDiscriminatorProp>>(callable: T): ChainRunner<
            TDiscriminatorProp,
            TEscapeType,
            [...TOutputAcc, Exclude<Awaited<ReturnType<T>>, TEscapeType>]
        > {
            return createChainRunner<
                TDiscriminatorProp,
                TEscapeType,
                [...TOutputAcc, Exclude<Awaited<ReturnType<T>>, TEscapeType>]
            >(discriminatorProp, isEscape, [...callChain, callable])
        },
        async run(): Promise<TEscapeType | ExtractLast<TOutputAcc>> {
            let acc: unknown = undefined;
            const accAll: unknown[] = [];
            for (let index = 0; index < callChain.length; index++) {
                acc = await callChain[index](acc, [...accAll]);
                if (isEscape(acc as DUnion<TDiscriminatorProp>)) {
                    return acc as TEscapeType;
                }
                accAll.push(acc);
            }
            return acc as ExtractLast<TOutputAcc>;
        }
    }
}

export const chain = <
    TDiscriminator extends string,
    TEscapeType extends DUnion<TDiscriminator>,
>(discriminatorProp: string,
  isEscape: (val: DUnion<TDiscriminator>) => val is TEscapeType): ChainRunner<TDiscriminator, TEscapeType, []> => {
    return createChainRunner<
        TDiscriminator,
        TEscapeType,
        []
    >(discriminatorProp, isEscape, [])
}

