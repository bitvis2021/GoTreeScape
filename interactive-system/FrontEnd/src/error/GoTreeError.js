export function GoTreeError(message) {
    var instance = new Error(message);
    instance.name = 'GoTreeError';
    Object.setPrototypeOf(instance, Object.getPrototypeOf(this));
    return instance;
}

export function throwGoTreeError (message) {
  try {
      throw new GoTreeError(message);
  } catch(e) {
      console.log(e, e.name + ":" + e.message);
  }
}

GoTreeError.prototype = {
    init: function() {

    }
}