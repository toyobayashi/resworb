require('fastclick')(document.body)

console.log(require('mod'))
console.log(require.main)

const Vue = require('vue/dist/vue.runtime.common.prod.js')

const vm = new Vue({
  data: {
    count: 0
  },
  methods: {
    testClick: function () {
      this.count++
    },
    testToast: function () {
      require('resworb').toast.show('test message', 'center').then(res => {
        console.log(res)
      })
    },
    logCallbacks: function () {
      console.log(__resworb_callbacks__)
    }
  },
  render: function (h) {
    return h('div', [
      h('div', [h('button', { on: { click: this.testToast } }, 'toast')]),
      h('div', [h('button', { on: { click: this.logCallbacks } }, 'callbacks')]),
      h('div', [h('button', { on: { click: this.testClick } }, 'add')]),
      this.count
    ])
  }
})

vm.$mount('#root');
