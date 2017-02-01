function getLesson() {
  $.get(`/demo/${currentLessonId}/text`, function(data) {
    jsonData = JSON.parse(data)
    translations = jsonData['translation']
    text = jsonData['text']
    category = jsonData['category']
    createTextNodes(jsonData['text'])
  })
  addExplanation()
}

function addExplanation() {
  if (currentLessonId === '1') {
    console.log('1')
    $("#explanation").css("height", "50px")
    $("#explanation").css("width", "1000px")
    $("#explanation").css("font-size", "12px")
    $("#explanation").text("To begin, try typing out the following sentence. For letters that have accents, you may type the closest non-accented letter - for example, in order to type 'é', you may simply type 'e'")
  }
}

function success() {
  conversions = {
    1: 'first',
    2: 'second',
    3: 'third',
    4: 'final',
  }
  if (currentLessonId === '4') {
    setTimeout(function() {
      swal({
        title: "Great job!",
        text: `You've completed the ${conversions[currentLessonId]} demo lesson.`,
        type: "success",
        confirmButtonText: `I want to sign up!`,
        confirmButtonColor: "#6b59ef",
        html: true
      })
      $('button.confirm').on('click', function() {
        window.location.href = '/complete'
      })
    }, 1000)
  } else {
    setTimeout(function() {
      swal({
        title: "Great job!",
        text: `You've completed the ${conversions[currentLessonId]} demo lesson.`,
        type: "success",
        confirmButtonText: `Take me to the next one!`,
        confirmButtonColor: "#6b59ef",
        html: true
      })
      $('button.confirm').on('click', function() {
        window.location.href = `/demo/${parseInt(currentLessonId) + 1}`
      })
    }, 1000)
  }
}
