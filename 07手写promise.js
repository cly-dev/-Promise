function Promise(executor) {
  this.PromiseState = "pending";
  this.PromiseResult = null;
  this.callbacks = [];
  const that = this;
  function resolve(value) {
    if (that.PromiseState == "pending") {
      that.PromiseState = "fulfilled";
      that.PromiseResult = value;
      that.callbacks.forEach((item) => {
        item.onResolve(value);
      });
    }
  }
  function reject(value) {
    if (that.PromiseState === "pending") {
      that.PromiseResult = value;
      that.PromiseState = "rejected";
      that.callbacks.forEach((item) => {
        item.onReject(value);
      });
    }
  }
  try {
    executor(resolve, reject);
  } catch (err) {
    reject(err);
  }
}
//策略
//1、同步任务:直接通过状态获取回调
//2、异步任务:保存回调,等待异步任务完成后在获取回调
//回调函数:根据状态获取对应的回调值
Promise.prototype.then = function (onResolve, onReject) {
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
        //获取回调执行结果
        const result = type(that.PromiseResult);
        if (result instanceof Promise) {
          result.then(
            (res) => {
              resolve(res);
            },
            (err) => {
              reject(err);
            }
          );
        } else {
          resolve(result);
        }
        resolve(result);
      } catch (err) {
        reject(err);
      }
    }
    if (this.PromiseState === "fulfilled") {
      callback(onResolve);
    }
    if (this.PromiseState === "rejected") {
      callback(onReject);
    }
    //如果为异步任务,则保存回调
    if (this.PromiseState == "pending") {
      this.callbacks.push({
        onReject: () => {
          callback(onReject);
        },
        onResolve: () => {
          callback(onResolve);
        },
      });
    }
  });
  //判断状态
};
//异常穿透
Promise.prototype.catch = function (onReject) {
  return this.then(undefined, onReject);
};
Promise.resolve = function (value) {
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
};
Promise.reject = function (value) {
  return new Promise((resolve, reject) => {
    reject(value);
  });
};
Promise.all = function (value) {
  let data = [];
  let num = 0;
  return new Promise((resolve, reject) => {
    for (let i = 0; i < value.length; i++) {
      if (value[i] instanceof Promise) {
        value[i].then(
          (res) => {
            num++;
            data[i] = res;
            if (num === value.length) {
              resolve(data);
            }
          },
          (err) => {
            reject(err);
          }
        );
      } else {
        data[i] = value;
        num++;
      }
    }
  });
};
Promise.race = function (value) {
  return new Promise((resolve, reject) => {
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
  });
};
