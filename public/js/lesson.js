function getLesson() {
  var currentLessonId = window.location.href.split('/').slice(-1)
  $.get(`/lessons/${currentLessonId}/text`, function(data) {
    jsonData = JSON.parse(data)
    translations = jsonData['translation']
    text = jsonData['text']
    category = jsonData['category']
    createTextNodes(jsonData['text'])
  })
}

function success() {
  $.post(window.location.pathname + '/completed', function() {})
  var scrubbedCategory = category.split('_').join(' ')
  scrubbedCategory = scrubbedCategory.charAt(0).toUpperCase() + scrubbedCategory.slice(1)
  scrubbedCategory = scrubbedCategory.replace(' i', ' I')
  scrubbedCategory = scrubbedCategory.replace(' ii', ' II')
  setTimeout(function() {
    swal({
      title: "Great job!",
      text: "You've completed a lesson.",
      type: "success",
      confirmButtonText: `Back to ${scrubbedCategory}`,
      confirmButtonColor: "#6b59ef",
      html: true
    })
    $('button.confirm').on('click', function() {
      window.location.href = `/category/${category}`
    })
  }, 1000)
}
