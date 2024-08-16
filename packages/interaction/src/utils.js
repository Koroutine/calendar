let busy = false;

export function animate(fn) {
  if (!busy) {
    busy = true;
    window.requestAnimationFrame(() => {
      fn();
      busy = false;
    });
  }
}

export function limit(value, minLimit, maxLimit) {
  return Math.max(minLimit, Math.min(maxLimit, value));
}

export function is_function(value) {
  return typeof value === "function";
}
