require 'google/cloud/translate'
require 'sinatra/sequel'

class Parser
  def initialize
    @db = Sequel.connect(ENV['DATABASE_URL'])
    @db.extension :pg_json
    @translator = Google::Cloud::Translate.new
  end

  def parse_text(text, category)
    words = text.split(' ')
    translation = Sequel.pg_json({})

    words.map.with_index do |word, index|
      current_sentence = words[0..index].join(' ')
      translated_chunk = @translator.translate(current_sentence, to: 'en')
      sanitized_chunk = translated_chunk.text.gsub("&#39;", "'").strip
      translation[current_sentence] = sanitized_chunk
    end
    language = @translator.translate(text, to: 'en').language

    vocab = {}
    vocab_words = text.split(' ').max_by(2) { |word| word.length}
    vocab_words.each do |word|
      word = word.split("'").last
      word.capitalize!
      word.gsub!(/[[:punct:]]/, '')
      translated_word = @translator.translate(word, to: 'en').text.gsub("&#39;", "'")
      translated_word.capitalize!
      vocab[word] = translated_word
    end

    @db[:lessons].insert(
      text: text,
      translation: translation,
      language: language,
      category: category,
      vocab: Sequel.pg_json(vocab)
    )
  end

  def parse_files()
    lengths = {
      'conversation_i': 20,
      'conversation_ii': 20,
      'news': 8,
      'literature': 8,
      'demo': 4
    }
    # ARGV.each do |file_path|
    #   text = File.read("lessons/fr/#{file_path}")
    #   category = file_path.split('/').last
    #   parse_text(text, category)
    # end
    [
      'demo',
      'conversation_i',
      'conversation_ii',
      'news',
      'literature'
    ].map do |category|
      (1..lengths[category.to_sym]).map do |n|
        text = File.read("lessons/fr/#{category}/#{n}")
        parse_text(text, category)
      end
    end
  end
end

p = Parser.new
p.parse_files
