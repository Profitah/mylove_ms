// Fixed-capacity FIFO buffer. Unlike Array#push + Array#shift (O(1) + O(n),
// since shift() re-indexes every remaining element), overwriting the oldest
// slot in place and advancing a head pointer keeps eviction O(1) too.
export class RingBuffer {
  constructor(capacity) {
    this.capacity = capacity
    this.buffer = new Array(capacity)
    this.head = 0 // index of the oldest element
    this.size = 0
  }

  push(entry) {
    const writeIndex = (this.head + this.size) % this.capacity
    this.buffer[writeIndex] = entry
    if (this.size < this.capacity) {
      this.size += 1
    } else {
      this.head = (this.head + 1) % this.capacity
    }
  }

  toArray() {
    const result = new Array(this.size)
    for (let i = 0; i < this.size; i++) {
      result[i] = this.buffer[(this.head + i) % this.capacity]
    }
    return result
  }
}
