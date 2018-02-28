import React from 'react';

function safeExec(fn, args) {
  try {
    return fn.apply(this, args);
  } catch (e) {
    console.warn(e);
    // render
    if (fn.name === 'render') {
      return (
        <div>
          出错了: {e.message}
        </div>
      );
    }
    return null;
  }
}

function handle(args) {
  if (args.length >= 1) {
    const { value: fn } = args[2] || {};
    if (typeof fn !== 'function') {
      throw new SyntaxError(`@safe can only be used on functions, not: ${fn}`);
    }
    return {
      get() {
        return (...params) => safeExec.bind(this)(fn, params);
      }
    };
  }
  return null;
}

export function safe(...args) {
  if (args.length === 0) {
    return (...params) => handle(params);
  }
  return handle(args);
}
