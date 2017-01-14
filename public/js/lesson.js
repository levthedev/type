var currentLetter
var currentNode
var cursor
var foreign
var text = ''
var completedText = ''
var translations = {}

function getLesson() {
  var currentLessonId = window.location.href.split('/').slice(-1)
  $.get(`/lessons/${currentLessonId}/text`, function(data) {
    jsonData = JSON.parse(data)
    translations = jsonData['translation']
    text = jsonData['text']
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
    if (currentNode && /\s/.test(currentNode.textContent)) {
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

// $('button.confirm').on('click', function() {
//   console.log('confirming')
//   window.location.href = '/categories'
// })

function success() {
  swal({
    title: "<strong>Great job!</strong>",
    text: "You've completed the first <em>lesson.</em>",
    type: "success",
    confirmButtonText: "Back to Categories",
    confirmButtonColor: "#6b59ef",
    html: true
  })
  $('button.confirm').on('click', function() {
    window.location.href = '/categories'
  })
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
  if (letter === 'ô') return 'o'
  if (letter === 'ç') return 'c'
}

function stopEventListeners() {
  document.body.removeEventListener('keypress', processKeyStrokes)
  document.body.removeEventListener('keydown', watchBackspace)
}
