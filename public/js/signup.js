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
  var amount = $('input#amount').val()
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
      let amount = Math.round(((e.pageX - rangeLeft) / rangeWidth) * 10 + 1)
      dragger.style.left = e.pageX - rangeLeft - draggerWidth + 'px'
      console.log(Math.round(((e.pageX - rangeLeft) / rangeWidth) * 100))
    }
  }
}

rangeSlider('range-slider')
