require 'google/cloud/translate'
require 'sinatra/sequel'

class Parser
  def initialize
    @db = Sequel.connect(ENV['DATABASE_URL'])
    @db.extension :pg_json
    @translator = Google::Cloud::Translate.new
  end

  def parse_text(text="")
    words = text.split(' ')
    translation = Sequel.pg_json({})

    words.map.with_index do |word, index|
      current_sentence = words[0..index].join(' ')
      translated_chunk = @translator.translate(current_sentence, to: 'en')
      translation[current_sentence] = translated_chunk.text.gsub("&#39;", "'")
    end
    language = @translator.translate(text, to: 'en').language
    @db[:lessons].insert(text: text, translation: translation, language: language)
  end

  def parse_files()
    ARGV.each do |file_path|
      text = File.read(file_path)
      parse_text(text)
    end
  end
end

p = Parser.new
p.parse_files
