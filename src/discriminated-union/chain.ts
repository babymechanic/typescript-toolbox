type Callable<TInput, TOutput> = (input: TInput) => Promise<TOutput>;
type DUnion<TDiscriminator extends string> = { [K: string]: unknown } & { [K in TDiscriminator]: unknown; };

const createChainRunner = <
    TDiscriminator extends string,
    TEscapeType extends DUnion<TDiscriminator>,
    TOutputAcc
>(
    discriminatorProp: string,
    isEscape: (val: DUnion<TDiscriminator>) => val is TEscapeType,
    callChain: ReadonlyArray<Callable<any, any>>) => {
    return {
        link<T extends Callable<TOutputAcc, DUnion<TDiscriminator>>>(callable: T) {
            return createChainRunner<
                TDiscriminator,
                TEscapeType,
                Exclude<Awaited<ReturnType<T>>, TEscapeType>
            >(discriminatorProp, isEscape, [...callChain, callable])
        },
        async run(): Promise<TEscapeType | TOutputAcc> {
            let acc: any = undefined;
            for (let index = 0; index < callChain.length; index++) {
                acc = await callChain[index](acc);
                if (isEscape(acc)) {
                    return acc;
                }
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
        undefined
    >(discriminatorProp, isEscape, [])
}
