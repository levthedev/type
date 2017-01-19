var currentLetter = undefined
var currentNode = undefined
var cursor = undefined
var foreign = undefined
var text = ''
var completedText = ''
var translations = {}
var category = 'conversation'
var currentLessonId = window.location.href.split('/').slice(-1)[0]

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

    if (currentNode.nextSibling) {
      currentNode = currentNode.nextSibling
      currentNode.classList.add('current')
      currentLetter = currentNode.textContent
    }
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
    currentNode.classList.remove('incorrect')
    currentNode.classList.remove('incorrect-space')
    currentNode.classList.remove('completed')
    currentNode.classList.remove('current')
    if (!$(currentNode).is(':first-child')) {
      currentNode = currentNode.previousSibling
      currentLetter = currentNode.textContent

      currentNode.previousSibling.appendChild(cursor)
      currentNode.classList.remove('completed')
      currentNode.classList.add('current')

      if (!(currentNode.classList.contains('incorrect') || currentNode.classList.contains('incorrect-space'))) {
        completedText = completedText.slice(0, -1)
      }
    }
  }
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
