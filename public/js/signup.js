function rangeSlider(id, onDrag) {
  var range = document.getElementById(id),
    dragger = range.children[0],
    draggerWidth = 10, // width of your dragger
    down = false,
    rangeWidth, rangeLeft;

  dragger.style.left = -draggerWidth + 'px'

  range.addEventListener("mousedown", function(e) {
    rangeWidth = this.offsetWidth
    rangeLeft = this.offsetLeft
    down = true
    updateDragger(e)
    return false
  })

  document.addEventListener("mousemove", function(e) {
    updateDragger(e)
  })

  document.addEventListener("mouseup", function() {
    down = false
  })

  function updateDragger(e) {
    if (down && e.pageX >= rangeLeft && e.pageX <= (rangeLeft + rangeWidth)) {
      let form = document.getElementById('stripe-form')
      let script = document.querySelector('#stripe-form button')
      let amount = Math.round(((e.pageX - rangeLeft) / rangeWidth) * 10 + 1)
      let newScript = `<script
                        src="https://checkout.stripe.com/checkout.js"
                        class="stripe-button"
                        id="stripe-button"
                        data-key="pk_test_wNSmUtnjPppeeG0wiWFGZIN4"
                        data-image="/square-image.png"
                        data-name="Paralela Subscription"
                        data-description="($${amount})"
                        data-amount="${amount}">
                      </script>`

      script.remove()
      form.innerHTML = newScript
      dragger.style.left = e.pageX - rangeLeft - draggerWidth + 'px'
      console.log(Math.round(((e.pageX - rangeLeft) / rangeWidth) * 100))
    }
  }
}

rangeSlider('range-slider')
