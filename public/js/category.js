document.querySelectorAll('.lesson').forEach(function(lesson) {
  var words = lesson.textContent.split(' ')
  var truncatedWords = ''
  var newWord = ''
  var index = 0
  newWord = ` ${words[index]}`
  
  while (truncatedWords.length + newWord.length < 25) {
    truncatedWords += newWord
    index++
    newWord = ` ${words[index]}`
  }
  lesson.textContent = truncatedWords + '...'

  if (lesson.classList.contains('completed')) {
    checkmark = document.createElement('div')
    checkmark.classList.add('checkmark')
    checkmark.innerHTML = '&#10003;'
    lesson.appendChild(checkmark)
  }
})
