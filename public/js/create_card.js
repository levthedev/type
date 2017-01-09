var card = new Card({
  form: '#payment-form',
  container: '.card-wrapper',
  formSelectors: {
    numberInput: 'input#number',
    expiryInput: '#exp_month ,#exp_year',
    cvcInput: 'input#cvc',
  },
  width: 200,
  formatting: true,
  messages: {
    validDate: 'valid\ndate',
    monthYear: 'mm/yyyy',
  },
  placeholders: {
    number: '•••• •••• •••• ••••',
    expiry: '••/••',
    cvc: '•••'
  },
  masks: {
    cardNumber: '•'
  },
  debug: false
})
