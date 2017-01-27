$('#price-link').click(function() {
  $('html, body').animate({
    scrollTop: $('#price').offset().top - 100
  }, 400)
})

// $('.faq-answer').toggle()
$('.faq-button').click(function() {
  $(this.nextSibling).next().toggle()
})

$.get('/stats/amrpu', function(data) {
  document.querySelector('#average').textContent = '$' + data
})

$.get('/stats/minmax', function(data) {
  data = JSON.parse(data)
  document.querySelector('.min').textContent = '$' + data.min
  document.querySelector('.max').textContent = '$' + data.max
})
