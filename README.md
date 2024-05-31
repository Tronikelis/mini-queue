# pocket-queue

Probably the smallest async queue with concurrency support

## Usage

Just wrap the function which you want to queue up with a closure and pass to `.run`, that's it

```ts
const queue = new AsyncQueue(10);

await queue.run(async () => {
    // process data
});
```
