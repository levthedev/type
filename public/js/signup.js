var sliderAmount = 1.95
var subscribeButton = $('#subscribeButton')
var amountSelector = $('#amount')
amountSelector.on('input', updateSubscribeButton)

function updateSubscribeButton(e) {
  var inputAmount = parseFloat(e.target.value)
  if (inputAmount) {
    subscribeButton.html(`Subscribe for $${inputAmount.toFixed(2)}/month`)
  }
}

email = document.getElementById('email').textContent
var handler = StripeCheckout.configure({
  key: stripe_public_key,
  locale: 'auto',
  name: 'Paralela',
  description: 'Subscription',
  email: email,
  token: function(token) {
    $('input#stripeToken').val(token.id);
    $('form').submit();
  }
})

$('#subscribeButton').on('click', function(e) {
  e.preventDefault()
  $('#error_explanation').html('')
  var amount = $('input#amount').val() || sliderAmount.toString()
  amount = amount.replace(/\$/g, '').replace(/\,/g, '')
  amount = parseFloat(amount)

  if (isNaN(amount)) {
    $('#error_explanation').html('<p>Please enter a valid amount in USD ($).</p>')
  }
  else if (amount < 1.00) {
    $('#error_explanation').html('<p>Donation amount must be at least $1.</p>')
  }
  else {
    amount = amount * 100
    handler.open({
      amount: Math.round(amount)
    })
  }
})

$(window).on('popstate', function() {
  handler.close()
})

function rangeSlider(id, onDrag) {
  var range = document.getElementById(id),
    dragger = range.children[0],
    draggerWidth = 25,
    down = false,
    rangeWidth, rangeLeft;

  dragger.style.width = draggerWidth + 'px'

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
      dragger.style.left = e.pageX - rangeLeft - draggerWidth + 'px'
      sliderAmount = Math.round(((e.pageX - rangeLeft) / rangeWidth) * 10 + 1)
      subscribeButton.html(`Subscribe for $${sliderAmount}/month`)
      subscribeButton[0].value = `Subscribe for $${sliderAmount}/month`
      amountSelector[0].value = sliderAmount
    }
  }
}

rangeSlider('range-slider')

$.get('/stats/amrpu', function(data) {
  document.querySelector('#average').textContent = '$' + data
})
