$("#price-link").click(function() {
  //TODO if not on home page, navigate there
  $('html, body').animate({
    scrollTop: $("#price").offset().top - 100
  }, 400)
})

document.querySelector('#average').textContent = '$2.39'
var average = 2.39
function incrementAverage() {
  document.querySelector('#average').textContent = '$' + average
  average = Math.floor(Math.random() * 10) + 1
  average += (Math.floor(Math.random() * 100) + 1) / 100
  average = average.toFixed(2)
}

setInterval(incrementAverage, 1500)