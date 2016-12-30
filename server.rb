require 'google/cloud/translate'
require 'sinatra'
require 'pry'
require './util/api_wrapper'

translate = Google::Cloud::Translate.new
api_wrapper = ApiWrapper.new()

get '/translate/:text' do
  translation = translate.translate(params[:text], to: 'en')
  puts translation.text
  translation.text
end

get '/demo' do
  erb :demo, :layout => :nav
end

get '/' do
  erb :index, :layout => :nav
end

get '/subscription/:amount/:token' do
  amount = params[:amount]
  token = params[:token]
  plan = api_wrapper.create_plan(amount)
  customer = api_wrapper.create_customer(token)
  api_wrapper.subscribe_customer_to_plan(customer, plan)

  erb :index, :layout => :nav
end

# TODO - first create plan and associate with current user based on slider or form input
# Then, have them actually checkout with Stripe form, which subscribes them to their plan

get '/token' do
  token = "cus_9q8X26BOlH34Be"
  plan = api_wrapper.create_plan(25)
  customer = api_wrapper.create_customer(token)
  api_wrapper.subscribe_customer_to_plan(customer, plan)
  erb :index, :layout => :nav
end

post '/your-charge-code' do
  token = params[:token]
  customer = api_wrapper.create_customer(token)
  puts customer

  erb :index, :layout => :nav
end
