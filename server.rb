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

get '/charge/:amount' do
  Stripe.api_key = ENV[:TEST_STRIPE_PRIVATE_KEY]
  amount = params[:amount]
  plan = Stripe::Plan.create(
    name: "Custom Plan - #{amount}",
    id: "#{amount}-monthly",
    interval: "month",
    currency: "usd",
    amount: amount,
  )

  erb :index, :layout => :nav
end
