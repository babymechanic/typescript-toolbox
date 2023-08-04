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


