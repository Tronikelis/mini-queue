type Task<T> = {
    fn: () => Promise<T>;
    success: (arg: T) => void;
    failure: (reason: unknown) => void;
};

export default class PocketQueue {
    private concurrency = 5;
    private running: Promise<unknown>[] = [];
    private waitlist: Promise<void>[] = [];
    private stack = 0;

    constructor(concurrency?: number) {
        if (concurrency !== undefined) {
            this.concurrency = concurrency;
        }
    }

    run<T>(fn: () => Promise<T>): Promise<T> {
        return new Promise((success, failure) => {
            void this.processTask({
                fn,
                success,
                failure,
            });
        });
    }

    private async processTask<T>(task: Task<T>) {
        this.stack++;

        let index = this.running.length;

        if (this.running.length >= this.concurrency) {
            const last = this.waitlist.at(-1);
            let done = () => {};

            this.waitlist.push(
                new Promise(res => {
                    done = res;
                })
            );

            if (last) {
                await last;
                void this.waitlist.pop();
            }

            index = await Promise.race(
                this.running.map(async (promise, index) => {
                    try {
                        await promise;
                    } catch {}

                    return index;
                })
            );

            done();
        }

        try {
            const promise = task.fn();
            this.running[index] = promise;
            task.success(await promise);
        } catch (err) {
            task.failure(err);
        }

        this.stack--;

        if (this.stack === 0) {
            this.waitlist = [];
            this.running = [];
        }
    }
}
