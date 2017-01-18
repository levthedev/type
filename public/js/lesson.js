var currentLetter
var currentNode
var cursor
var foreign
var text = ''
completedText = ''
var translations = {}
var category = 'conversation'

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

document.addEventListener('DOMContentLoaded', function() {
  getLesson()
  createCursor()
  document.body.addEventListener('keypress', processKeyStrokes)
  document.body.addEventListener('keydown', watchBackspace)
})

function createCursor() {
  foreign = document.getElementById('foreign')
  cursor = document.createElement('span')
  cursor.id = 'cursor'
  foreign.appendChild(cursor)
}

function createTextNodes(text) {
  text.split('').map(function(letter, i) {
    if (letter === "\n") {
      var br = document.createElement('br')
      foreign.appendChild(br)
      foreign.appendChild(br)
      letter = "\n"
    }
    var span = document.createElement('span')
    span.classList.add('letter')
    span.innerHTML = letter
    if (i === 0) {
      span.classList.add('current')
      currentLetter = letter
      currentNode = span
    }
    foreign.appendChild(span)
  })
}

function processKeyStrokes(event) {
  event = event || window.event
  var charCode = event.which || event.keyCode
  var charCodeString = String.fromCharCode(charCode)

  if (charCodeString === currentLetter || charCodeString === normalized(currentLetter)) {
    advanceNode()
    if ((currentNode && /\s|\n/.test(currentNode.textContent)) || !currentNode) {
      translate()
    }
  } else {
    currentNode.classList.add('incorrect')
    if (currentNode.textContent === ' ') currentNode.classList.add('incorrect-space')
    currentNode.appendChild(cursor)

    currentNode = currentNode.nextSibling
    currentNode.classList.add('current')

    currentLetter = currentNode.textContent
  }
  if (event.keyCode === 32 || event.which === 32) { event.preventDefault(); return false }
}

function advanceNode() {
  currentNode.classList.remove('current')
  currentNode.classList.remove('incorrect')
  currentNode.classList.remove('incorrect')
  currentNode.classList.remove('incorrect-space')
  currentNode.classList.add('completed')
  currentNode.appendChild(cursor)
  completedText += currentNode.textContent

  currentNode = currentNode.nextSibling
  if (completedText == text) {
    stopEventListeners()
    success()
  } else if (currentNode) {
    currentNode.classList.add('current')
    currentLetter = currentNode.textContent
  }
  // if (currentNode.nodeName === 'BR') {
  //   advanceNode()
  // }
}

function watchBackspace(event) {
  if (event.keyCode === 8) {
    event.preventDefault()
    if (!$(currentNode.previousSibling).is(':first-child')) {
      currentNode.classList.remove('current')
      currentNode.classList.remove('incorrect')
      currentNode.classList.remove('incorrect-space')
      currentNode.classList.remove('completed')

      currentNode = currentNode.previousSibling
      currentNode.previousSibling.appendChild(cursor)
      currentNode.classList.remove('completed')
      currentNode.classList.add('current')

      currentLetter = currentNode.textContent
      if (!(currentNode.classList.contains('incorrect') || currentNode.classList.contains('incorrect-space'))) {
        completedText = completedText.slice(0, -1)
      }
    }
  }
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

function translate() {
  translation = document.getElementById("translation")
  translation.textContent = translations[completedText]
}

function normalized(letter) {
  if (letter === 'é' || letter === 'è' || letter === 'ê' || letter === 'ë') return 'e'
  if (letter === 'ù' || letter === 'û' || letter === 'ü') return 'u'
  if (letter === 'à' || letter === 'â') return 'a'
  if (letter === 'î' || letter === 'ï') return 'i'
  if (letter === 'ô' ||  letter === 'œ') return 'o'
  if (letter === 'ç') return 'c'
}

function stopEventListeners() {
  document.body.removeEventListener('keypress', processKeyStrokes)
  document.body.removeEventListener('keydown', watchBackspace)
}
