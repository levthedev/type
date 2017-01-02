Stripe.setPublishableKey('pk_test_wNSmUtnjPppeeG0wiWFGZIN4')
var $form = $('#payment-form')

function stripeResponseHandler(status, response) {
  if (response.error) {
    $form.find('.payment-errors').text(response.error.message)
    $form.find('.submit').prop('disabled', false)
  } else {
    var token = response.id
    $form.append($('<input type="hidden" name="stripeToken">').val(token))
    $form.get(0).submit()
  }
}

$(function() {
  $form.submit(function(event) {
    $form.find('.submit').prop('disabled', true)
    Stripe.card.createToken($form, stripeResponseHandler)
    return false
  })
})
