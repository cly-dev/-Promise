//重写Promise对象
class Promise {
  constructor(executor) {
    this.PromiseState = "pending";
    this.PromiseResult = undefined;
    this.callbacks = [];
    this.resolve = this.resolve.bind(this);
    this.reject = this.reject.bind(this);
    try {
      executor(this.resolve, this.reject);
    } catch (err) {
      this.reject(err);
    }
  }
  resolve(value) {
    if (this.PromiseState === "pending") {
      this.PromiseState = "fullfailed";
      this.PromiseResult = value;
      this.callbacks.forEach((value) => {
        setTimeout(() => {
          value.onResolve(this.PromiseResult);
        });
      });
    }
  }
  reject(value) {
    if (this.PromiseState === "pending") {
      this.PromiseState = "rejected";
      this.PromiseResult = value;
      setTimeout(() => {
        this.callbacks.forEach((value) => {
          value.onReject(this.PromiseResult);
        });
      });
    }
  }
  then(onResolve, onReject) {
    const that = this;
    if (typeof onReject !== "function") {
      onReject = (err) => {
        throw err;
      };
    }
    if (typeof onResolve !== "function") {
      onResolve = (value) => value;
    }
    return new Promise((resolve, reject) => {
      function callback(type) {
        try {
          const result = type(that.PromiseResult);
          if (result instanceof Promise) {
            result.then(
              (v) => {
                resolve(v);
              },
              (r) => {
                reject(r);
              }
            );
          } else {
            resolve(result);
          }
        } catch (err) {
          reject(err);
        }
      }

      if (this.PromiseState === "fullfailed") {
        setTimeout(() => {
          callback(onResolve);
        });
      }
      if (this.PromiseState === "rejected") {
        setTimeout(() => {
          callback(onReject);
        });
      }
      if (this.PromiseState === "pending") {
        this.callbacks.push({
          onResolve: () => {
            callback(onResolve);
          },
          onReject: () => {
            callback(onReject);
          },
        });
      }
    });
  }
  catch(onReject) {
    return this.then(undefined, onReject);
  }
  static resolve(value) {
    return new Promise((resolve, reject) => {
      try {
        if (value instanceof Promise) {
          value.then(
            (res) => {
              resolve(res);
            },
            (err) => {
              reject(err);
            }
          );
        } else {
          resolve(value);
        }
      } catch (err) {
        reject(err);
      }
    });
  }
  static reject(value) {
    return new Promise((resolve, reject) => {
      reject(value);
    });
  }
  static all(value) {
    let data = [];
    let n = 0;
    return new Promise((resolve, reject) => {
      for (let i = 0; i < value.length; i++) {
        if (value[i] instanceof Promise) {
          value[i].then(
            (res) => {
              n++;
              data[i] = res;
              if (n === value.length) {
                resolve(data);
              }
            },
            (err) => {
              reject(err);
            }
          );
        } else {
          n++;
          data[i] = value[i];
        }
      }
    });
  }
  static race(value) {
    return new Promise((resolve, reject) => {
      try {
        for (let i = 0; i < value.length; i++) {
          if (value[i] instanceof Promise) {
            value[i].then(
              (res) => {
                resolve(res);
              },
              (err) => {
                reject(err);
              }
            );
          } else {
            resolve(value[i]);
          }
        }
      } catch (err) {
        reject(err);
      }
    });
  }
}
