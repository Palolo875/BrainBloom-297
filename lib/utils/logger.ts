export const logger = {
  warn: (...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(...args);
    }
  },
  error: (...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.error(...args);
    }
  }
};

