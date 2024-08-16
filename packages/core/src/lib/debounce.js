export function debounce(fn, handle, queueStore) {
  queueStore.update((queue) => queue.set(handle, fn));
}

export function flushDebounce(queue) {
  queue.forEach((callback) => callback());
  queue.clear();
}

export function task(fn, handle, tasks) {
  handle ??= fn;
  if (!tasks.has(handle)) {
    tasks.set(
      handle,
      setTimeout(() => {
        tasks.delete(handle);
        fn();
      })
    );
  }
}
