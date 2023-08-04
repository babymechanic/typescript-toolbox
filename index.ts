import { createChainRunner } from './src/discriminated-union/chain';
import { createHandler } from './src/discriminated-union/handle';

type SuccessResult = { status: 'success'; message: string; };
type ErrorResult = { status: 'error'; errorMessage: string; };
type WarningResult = { status: 'warning'; warnMessage: string; };
type Result = SuccessResult | ErrorResult | WarningResult;


const handler = createHandler<'status', Result, Promise<string>>('status', {
    error: (val) => Promise.resolve(val.errorMessage),
    success: (val) => Promise.resolve(val.message),
    warning: (val) => Promise.resolve(val.warnMessage),
});

const val = { status: 'warning', warnMessage: 'something seems wrong' } satisfies Result;

handler(val)
    .then((x) => console.log(x))
    .catch((e) => console.error(e));


type EscapeError = { status: 'error'; error: string };
type Output1 = { status: 'output1'; message1: string };
type Output2 = { status: 'output2'; message2: number };
type Output3 = { status: 'output3'; message3: Date };

const func1 = async (): Promise<EscapeError | Output1> => {
    return { status: 'output1', message1: 'hello' };
}
const func2 = async (_: Output1): Promise<EscapeError | Output2> => {
    return { status: 'output2', message2: 213123 };
}
const func3 = async (_: Output2): Promise<EscapeError | Output3> => {
    return { status: 'output3', message3: new Date() };
}

createChainRunner('status', (val): val is EscapeError => val.status === 'error')
    .next(func1)
    .next(func2)
    .next(func3)
    .run()
    .then((a) => {
        if (a.status === 'error') {
            console.log(a.error);
        } else {
            console.log(a.message3);
        }
    })

