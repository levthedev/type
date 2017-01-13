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
    @db[:lessons].insert(
      text: text,
      translation: translation,
      language: language,
      category: category
    )
  end

  def parse_files()
    # ARGV.each do |file_path|
    #   text = File.read("lessons/fr/#{file_path}")
    #   category = file_path.split('/').last
    #   parse_text(text, category)
    # end
    ['conversation', 'stories', 'news', 'poetry'].map do |category|
      (1..8).map do |n|
        text = File.read("lessons/fr/#{category}/#{n}")
        parse_text(text, category)
      end
    end
  end
end

p = Parser.new
p.parse_files
