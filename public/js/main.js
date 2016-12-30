var currentLetter
var currentNode
var cursor
var foreign
var completedText = ''

document.addEventListener('DOMContentLoaded', function() {
  createCursor()
  createTextNodes()
  document.body.addEventListener('keypress', processKeyStrokes)
  document.body.addEventListener('keydown', watchBackspace)
  document.querySelector('#price-link').href = 'http://localhost:9292/#line'
})

function createCursor() {
  foreign = document.getElementById('foreign')
  cursor = document.createElement('span')
  cursor.id = 'cursor'
  foreign.appendChild(cursor)
}

function createTextNodes() {
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
    if (currentNode && /[.,?!;: ]/.test(currentNode.textContent)) {
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
  if (currentNode) {
    currentNode.classList.add('current')
    currentLetter = currentNode.textContent
  } else {
    stopEventListeners()
    alert('Finished')
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
      completedText = completedText.slice(0, -1)
    }
  }
}

function translate() {
  $.get(`/translate/${completedText}`, function(data) {
    translation = document.getElementById("translation")
    translation.textContent = data
  })
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
