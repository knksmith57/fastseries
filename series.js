var xtend = require('xtend')
var defaults = {
  released: nop,
  results: true
}

function fastseries (options) {
  options = xtend(defaults, options)

  var released = options.released
  var Holder = options.results ? ResultsHolder : NoResultsHolder
  var head = new Holder(release)
  var tail = head

  return series

  function series (that, toCall, arg, done) {
    var holder = head

    if (holder.next) {
      head = holder.next
    } else {
      head = new Holder(release)
      tail = head
    }

    holder.next = null

    if (toCall.length === 0) {
      done.call(that)
      released(head)
    } else {
      holder._callback = done

      if (toCall.call) {
        holder._list = arg
        holder._each = toCall
      } else {
        holder._list = toCall
        holder._arg = arg
      }

      holder._callThat = that
      holder.release()
    }
  }

  function release (holder) {
    tail.next = holder
    tail = holder
    released()
  }
}

function reset () {
  this._list = null
  this._arg = null
  this._callThat = null
  this._callback = nop
  this._each = null
}

function NoResultsHolder (_release) {
  reset.call(this)
  this.next = null

  var that = this
  var i = 0
  this.release = function () {
    if (i < that._list.length) {
      if (that._each) {
        that._each.call(that._callThat, that._list[i++], that.release)
      } else {
        that._list[i++].call(that._callThat, that._arg, that.release)
      }
    } else {
      that._callback.call(that._callThat)
      reset.call(that)
      i = 0
      _release(that)
    }
  }
}

function ResultsHolder (_release) {
  reset.call(this)

  this._results = []
  this.next = null

  var that = this
  var i = 0
  this.release = function (err, result) {
    if (i !== 0) that._results[i - 1] = result

    if (!err && i < that._list.length) {
      if (that._each) {
        that._each.call(that._callThat, that._list[i++], that.release)
      } else {
        that._list[i++].call(that._callThat, that._arg, that.release)
      }
    } else {
      that._callback.call(that._callThat, err, that._results)
      reset.call(that)
      that._results = []
      i = 0
      _release(that)
    }
  }
}

function nop () { }

module.exports = fastseries
