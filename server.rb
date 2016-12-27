require "google/cloud/translate"
require 'sinatra'

translate = Google::Cloud::Translate.new

get '/translate/:text' do
  translation = translate.translate(params[:text], to: "en")
  puts translation.text
  translation.text
end

get '/' do
  File.read(File.join('public', 'index.html'))
end
