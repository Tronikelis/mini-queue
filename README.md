# pocket-queue

<div align="center">

<img src="https://img.shields.io/bundlephobia/minzip/pocket-queue?style=flat-square" />
<img src="https://img.shields.io/npm/v/pocket-queue?style=flat-square" />
<img src="https://img.shields.io/badge/dependencies-0-success?style=flat-square" />
 
</div>

Probably the smallest async queue with concurrency support

## Usage

Just wrap the function which you want to queue up with a closure and pass to `.run`, that's it

```ts
const queue = new AsyncQueue(10);

await queue.run(async () => {
    // process data
});
```
