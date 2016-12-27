let currentLetter
let currentNode
let cursor
let foreign
let completedText = ''

document.addEventListener('DOMContentLoaded', () => {
  createCursor()
  createTextNodes()
  processKeyStrokes()
  watchBackspace()
})

function createCursor() {
  foreign = document.getElementById('foreign')
  cursor = document.createElement('span')
  cursor.id = 'cursor'
  foreign.appendChild(cursor)
}

function createTextNodes() {
  text.split('').map((letter, i) => {
    let span = document.createElement('span')
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

function processKeyStrokes() {
  document.onkeypress = (e) => {
    e = e || window.event
    let charCode = e.which || e.keyCode
    let charCodeString = String.fromCharCode(charCode)

    if (charCodeString === currentLetter || charCodeString === normalized(currentLetter)) {
      advanceNode()
      if (currentNode.textContent === ' ') {
        translate()
      }
    } else {
      currentNode.classList.add('incorrect')
      currentNode.appendChild(cursor)

      currentNode = currentNode.nextSibling
      currentNode.classList.add('current')

      currentLetter = currentNode.textContent
    }

    if (e.keyCode === 32) return false
  }
}

function advanceNode() {
  currentNode.classList.remove('current')
  currentNode.classList.remove('incorrect')
  currentNode.classList.add('completed')
  currentNode.appendChild(cursor)
  completedText += currentNode.textContent

  currentNode = currentNode.nextSibling
  currentNode.classList.add('current')

  currentLetter = currentNode.textContent
}

function watchBackspace() {
  document.onkeydown = (e) => {
    if (e.keyCode === 8) {
      currentNode.classList.remove('current')
      currentNode.classList.remove('incorrect')
      currentNode.classList.remove('completed')

      currentNode = currentNode.previousSibling
      currentNode.previousSibling.appendChild(cursor)
      currentNode.classList.remove('completed')
      currentNode.classList.add('current')

      currentLetter = currentNode.textContent
    }
  }
}

function translate() {
  $.get(`/translate/${completedText}`, function(data) {
    translation = document.getElementById("translation")
    console.log(data)
    translation.textContent = data
  });
}

function normalized(letter) {
  if (letter === 'é' || letter === 'è' || letter === 'ê' || letter === 'ë') return 'e'
  if (letter === 'ù' || letter === 'û' || letter === 'ü') return 'u'
  if (letter === 'à' || letter === 'â') return 'a'
  if (letter === 'î' || letter === 'ï') return 'i'
  if (letter === 'ô') return 'o'
  if (letter === 'ç') return 'c'
}
