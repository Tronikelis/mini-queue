import { it, vi, expect, beforeEach, afterEach } from "vitest";
import PocketQueue from "src";

const waitFor = (ms: number) => new Promise<number>(res => setTimeout(() => res(ms), ms));

beforeEach(() => {
    vi.useFakeTimers();
});

afterEach(() => {
    vi.useRealTimers();
});

it("completes singular task", async () => {
    const fn = vi.fn().mockResolvedValue("foo");
    const q = new PocketQueue();

    const result = await q.run(fn);

    expect(fn).toHaveBeenCalled();
    expect(result).toBe("foo");
});

it("runs tasks concurrently", async () => {
    const q = new PocketQueue(2);

    const fn1 = vi.fn().mockResolvedValue(1);
    const fn2 = vi.fn().mockResolvedValue(2);
    const fn3 = vi.fn().mockResolvedValue(3);

    q.run(fn1);
    q.run(fn2);
    q.run(fn3);

    expect(fn1).toHaveBeenCalled();
    expect(fn2).toHaveBeenCalled();
    expect(fn3).not.toHaveBeenCalled();

    await vi.runAllTimersAsync();

    expect(fn3).toHaveBeenCalled();
});

it("works with concurrency 1", async () => {
    const q = new PocketQueue(1);

    const fnSlow = vi.fn(() => waitFor(1000));
    const fnFaster = vi.fn(() => waitFor(500));
    const fnFastest = vi.fn().mockResolvedValue(0);

    q.run(fnSlow);
    q.run(fnFaster);
    q.run(fnFastest);

    expect(fnSlow).toHaveBeenCalled();
    expect(fnFaster).not.toHaveBeenCalled();
    expect(fnFastest).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1000);

    expect(fnFaster).toHaveBeenCalled();
    expect(fnFastest).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(500);

    expect(fnFastest).toHaveBeenCalled();
});

it("instantly fires new tasks once any task finishes", async () => {
    const q = new PocketQueue(2);

    const fnSlow = vi.fn(() => waitFor(1000));
    const fnFaster = vi.fn(() => waitFor(500));
    const fnFastest = vi.fn().mockResolvedValue(0);

    q.run(fnSlow);
    q.run(fnFaster);
    q.run(fnFastest);

    expect(fnSlow).toHaveBeenCalled();
    expect(fnFaster).toHaveBeenCalled();
    expect(fnFastest).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(500);

    expect(fnFastest).toHaveBeenCalled();
});
