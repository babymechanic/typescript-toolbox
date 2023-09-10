![publish](https://github.com/babymechanic/typescript-toolbox/actions/workflows/publish.yml/badge.svg?branch=release)

# typescript-toolbox

A collection of utils to make using typescript features easier.

## How to import 

Your can import everything or only modules that you need. e.g.

```typescript
// use this to import the root module
import { discriminatedUnion, typeManipulation, assertions } from 'typescript-toolbox';

const handler = discriminatedUnion.createHandler(...);
type Test = typeManipulation.ExtractByProp<'prop', 'test', { prop: 'test' }>;
const isNotNull = assertions.propsAreNotNull({}, []);

// use this to import the specific module
import type { ExtractByProp, ExtractLast, DeepRequired } from 'typescript-toolbox/type-manipulation';
import { propsAreNotNull } from 'typescript-toolbox/assertions';
import { createHandler, createEventEmitter, chain } from 'typescript-toolbox/discriminated-union';
```

## Available utilities

### typescript-toolbox/type-manipulation

Utils to leverage the type system

#### ExtractByProp

Extracts the type in a discriminated union by the common prop.

```typescript
import { ExtractByProp } from 'typescript-toolbox/type-manipulation';

type Success = { type: 'success' };
type Failure = { type: 'failure' };

type AlsoFailure = ExtractByProp<'type', 'failure', Success | Failure>;
```

#### ExtractLast

Extracts the type of the last element in an array type 

```typescript
import { ExtractLast } from 'typescript-toolbox/type-manipulation';

type AlsoDate = ExtractLast<[string, number, Date]>;
```

#### PartialExcept

Makes everything optional and makes the selected props required

```typescript
import { PartialExcept } from 'typescript-toolbox/type-manipulation';

type Test = {
    becomesRequired?: string;
    becomesPartial: string;
}

type Mapped = PartialExcept<Test, 'becomesRequired'>;
// {
//     becomesRequired: string;
//     becomesPartial?: string | undefined;
// }
```

#### DeepRequired

Makes the object deep required

```typescript
import { DeepRequired } from 'typescript-toolbox/type-manipulation';

type AllRequired = DeepRequired<{ grandParent?: { parent?: { child?: string | undefined } } }>;
// { grandParent: { parent: { child: string } } }

```

#### typedKeys

Get array of typed keys from an object

```typescript
import { typedKeys } from 'typescript-toolbox/type-manipulation';

const keys = typedKeys({ prop1: 'test', prop2: 'test' });

// type is ('prop1' | 'prop2')[]
```

### typescript-toolbox/discriminated-union

Tools built around discriminated unions

#### chain

Use this when you are dealing with a sequence of calls which results in discriminated unions.
Instead of you having to define a guard clause after each call you can define a one time type assert. 

```typescript
import { chain } from 'typescript-toolbox/discriminated-union';

type Escape = { status: 'error'; error: string };
type Output1 = { status: 'output1'; message1: string[] };
type Output2 = { status: 'output2'; message2: string[] };
type Output3 = { status: 'output3'; message3: string[] };

// define your escape condition and type
const chainSeed = chain('status', (val): val is Escape => val.status === 'error');

const func1 = async (): Promise<Escape | Output1> =>
    ({ status: 'output1', message1: ['message1'] });
const func2 = async (input: Output1): Promise<Escape | Output2> =>
    ({ status: 'output2', message2: [...input.message1, 'message2'] });
const func3 = async (input: Output2): Promise<Escape | Output3> =>
    ({ status: 'output3', message3: [...input.message2, 'message3'] });

const result = await chainSeed
    .link(func1)
    // recieve the non escaped output of previous func return
    // also receive a typed array of all previous function call outputs
    .link(func2)
    .link(func3)
    .run();

// the final result is discriminated union of escape type and the final function output
if (result.status === 'error') {
    console.error(result.error);
} else {
    console.log(result.message3);
}
```

#### createEventEmitter

Creates a typed event emitter

```typescript
import { createEventEmitter } from 'typescript-toolbox/discriminated-union';

type Event1 = { name: 'event1'; prop1: string; };
type Event2 = { name: 'event2'; prop2: number; };

const eventEmitter = createEventEmitter<Event1 | Event2>();

// get typed args in the callback
// use returned function to unregister
const unsub1 = eventEmitter.on('event1', async (args) => {
    console.log(args);
});

const unsub2 = eventEmitter.on('event2', async (args) => {
    console.log(args);
});

// restrict to the defined types and type check based on discriminated type
await eventEmitter.emit({ name: 'event2', prop2: 128973912 });
```

#### createHandler

Use this to ensure at compile time that all types of the discriminated union have been handled.

```typescript
import { createHandler } from 'typescript-toolbox/discriminated-union';

type SuccessResult = { status: 'success'; message: string; };
type ErrorResult = { status: 'error'; errorMessage: string; };
type WarningResult = { status: 'warning'; warnMessage: string; };
type Result = SuccessResult | ErrorResult | WarningResult;

const handle = createHandler<'status', Result, string>('status', {
    error: (val) => {
        return `The error is: ${ val.errorMessage }`;
    },
    success: (val) => {
        return `The success message is: ${ val.message }`;
    },
    warning: (val) => {
        return `The warning is: ${ val.warnMessage }`;
    },
});

const output = handle({status: 'error', errorMessage: 'something went wrong'});

console.log(output);
```

### typescript-toolbox/assertions

#### propsAreNotNull

Use this for type asserting on your props

```typescript
import { propsAreNotNull } from 'typescript-toolbox/assertions';

type TestInput = {
    prop1?: string | undefined;
    prop2?: string | undefined;
}

const input: TestInput = { prop1: 'test 1', prop2: undefined };

if (propsAreNotNull(input, ['prop1'])) {
    // prop1 becomes non nullable here
    console.log(input.prop1);
}

```

# License

MIT License

Copyright (c) 2022 Mohnish Chowdhury

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
