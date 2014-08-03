module.exports = MessageQueue;

function MessageQueue (capacity) {
  this._capacity = getCapacity(capacity);
  this.length = 0;
  this._front = 0;
  this._makeCapacity();
}

MessageQueue.prototype._makeCapacity = function MessageQueue$_makeCapacity () {
  var len = this._capacity;
  for (var i = 0; i < len; ++i) {
    this[i] = {topic: void 0, entity: void 0, component: void 0};
  }
};

MessageQueue.prototype._resizeTo = function MessageQueue$_resizeTo (capacity) {
  var oldFront = this._front;
  var oldCapacity = this._capacity;
  var oldDeque = new Array(oldCapacity);
  var length = this.length;

  arrayCopy(this, 0, oldDeque, 0, oldCapacity);
  this._capacity = capacity;
  this._makeCapacity();
  this._front = 0;
  if (oldFront + length <= oldCapacity) {
    arrayCopy(oldDeque, oldFront, this, 0, length);
  } else {
    var lengthBeforeWrapping = length - ((oldFront + length) & (oldCapacity - 1));
    arrayCopy(oldDeque, oldFront, this, 0, lengthBeforeWrapping);
    arrayCopy(oldDeque, 0, this, lengthBeforeWrapping, length - lengthBeforeWrapping);
  }
};

MessageQueue.prototype.toArray = function MessageQueue$toArray () {
  var len = this.length;
  var ret = new Array(len);
  var front = this._front;
  var capacity = this._capacity;
  for (var j = 0; j < len; ++j) {
    ret[j] = this[(front + j) & (capacity - 1)];
  }
  return ret;
};

MessageQueue.prototype.publish =
MessageQueue.prototype.add = function MessageQueue$queue (topic, entity, component) {
  var argsLength = arguments.length;
  var length = this.length;

  if (argsLength === 0) return length;

  if (this._capacity < (length + 1)) {
    this._resizeTo(getCapacity(this._capacity * 1.5 + 16));
  }

  var i = (this._front + length) & (this._capacity - 1);

  this[i].entity = entity;
  this[i].component = component;
  this[i].topic = topic;

  this.length = length + 1;
  return length + 1;
};

MessageQueue.prototype.consume =
MessageQueue.prototype.remove = function MessageQueue$dequeue () {
  var length = this.length;
  if (length === 0) return void 0;
  var front = this._front;
  var ret = this[front];
  this._front = (front + 1) & (this._capacity - 1);
  this.length = length - 1;
  return ret;
};

function arrayCopy (src, srcIndex, dst, dstIndex, len) {
  for (var j = 0; j < len; ++j) {
    dst[j + dstIndex] = src[j + srcIndex];
  }
}

function pow2AtLeast (n) {
  n = n >>> 0;
  n = n - 1;
  n = n | (n >> 1);
  n = n | (n >> 2);
  n = n | (n >> 4);
  n = n | (n >> 8);
  n = n | (n >> 16);
  return n + 1;
}

function getCapacity (capacity) {
  if (capacity !== (capacity | 0)) return 16;
  return pow2AtLeast(
    Math.min(
      Math.max(16, capacity), 1073741824)
  );
}