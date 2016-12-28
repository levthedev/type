require "google/cloud/translate"
require 'sinatra'

translate = Google::Cloud::Translate.new

get '/translate/:text' do
  translation = translate.translate(params[:text], to: "en")
  puts translation.text
  translation.text
end

get '/demo' do
  erb :demo, :layout => :nav
end

get '/' do
  erb :index, :layout => :nav
end
