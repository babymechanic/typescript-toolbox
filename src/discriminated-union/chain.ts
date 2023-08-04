import { ExtractLast } from '../type-manipulation';

type DUnion<TDiscriminator extends string> = { [K: string]: unknown } & { [K in TDiscriminator]: unknown; };

type Callable<TOutputAcc extends any[], TDiscriminator extends string> = TOutputAcc['length'] extends 0
    ? () => Promise<DUnion<TDiscriminator>>
    : (input: ExtractLast<TOutputAcc>, previousOutputs: TOutputAcc) => Promise<DUnion<TDiscriminator>>;

const createChainRunner = <
    TDiscriminator extends string,
    TEscapeType extends DUnion<TDiscriminator>,
    TOutputAcc extends any[],
>(
    discriminatorProp: string,
    isEscape: (val: DUnion<TDiscriminator>) => val is TEscapeType,
    callChain: ReadonlyArray<(...args: any[]) => any>) => {
    return {
        link<T extends Callable<TOutputAcc, TDiscriminator>>(callable: T) {
            return createChainRunner<
                TDiscriminator,
                TEscapeType,
                [...TOutputAcc, Exclude<Awaited<ReturnType<T>>, TEscapeType>]
            >(discriminatorProp, isEscape, [...callChain, callable])
        },
        async run(): Promise<TEscapeType | ExtractLast<TOutputAcc>> {
            let acc: any = undefined;
            const accAll: any[] = [];
            for (let index = 0; index < callChain.length; index++) {
                acc = await callChain[index](acc, [...accAll]);
                if (isEscape(acc)) {
                    return acc;
                }
                accAll.push(acc);
            }
            return acc;
        }
    }
}


export const chain = <
    TDiscriminator extends string,
    TEscapeType extends DUnion<TDiscriminator>,
>(discriminatorProp: string,
  isEscape: (val: DUnion<TDiscriminator>) => val is TEscapeType) => {
    return createChainRunner<
        TDiscriminator,
        TEscapeType,
        []
    >(discriminatorProp, isEscape, [])
}


type A = [number, string];
