console.log(require('mod'))
console.log(require('path'))
console.log(require('fs'))
console.log(require('module'))
console.log(module)
console.log(exports)
console.log(require)
console.log(require.main)

document.getElementById('toast').addEventListener('click', function () {
  require('resworb').toast.show('test message', 'center').then(res => {
    console.log(res)
  })
})
document.getElementById('callbacks').addEventListener('click', function () {
  console.log(__resworb_callbacks__)
})
