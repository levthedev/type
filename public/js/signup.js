var sliderAmount = 1.95
var donateButton = $('#donateButton')

var handler = StripeCheckout.configure({
  key: 'pk_test_wNSmUtnjPppeeG0wiWFGZIN4',
  locale: 'auto',
  name: 'Paralela',
  description: 'Subscription',
  token: function(token) {
    $('input#stripeToken').val(token.id);
    $('form').submit();
  }
})

$('#donateButton').on('click', function(e) {
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
      donateButton.html(`Subscribe for $${sliderAmount}/month`)
    }
  }
}

rangeSlider('range-slider')

document.querySelector('#average').textContent = '$2.39'
var average = 2.39
function incrementAverage() {
  document.querySelector('#average').textContent = '$' + average
  average = Math.floor(Math.random() * 10) + 1
  average += (Math.floor(Math.random() * 100) + 1) / 100
  average = average.toFixed(2)
}

setInterval(incrementAverage, 1500)
