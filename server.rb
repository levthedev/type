require 'sinatra'
require 'sinatra/sequel'
require 'omniauth'
require 'omniauth-google-oauth2'
require 'google/cloud/translate'
require './util/stripe_wrapper'

configure do
	DB = Sequel.connect(ENV['DATABASE_URL'] || 'sqlite://database.db')
end

enable :sessions
set :session_secret, ENV['SESSION_SECRET']

use OmniAuth::Builder do
  provider :google_oauth2, ENV['GOOGLE_CLIENT_ID'], ENV['GOOGLE_CLIENT_SECRET'], {access_type: 'offline', prompt: 'consent', scope: 'userinfo.email'}
end

stripe_api_wrapper = StripeWrapper.new()
translate = Google::Cloud::Translate.new

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
  plan = stripe_api_wrapper.create_plan(amount)
  customer = stripe_api_wrapper.create_customer(token)
  stripe_api_wrapper.subscribe_customer_to_plan(customer, plan)

  erb :index, :layout => :nav
end

# TODO - first create plan and associate with current user based on slider or form input
# Then, have them actually checkout with Stripe form, which subscribes them to their plan

get '/token' do
  token = 'cus_9q8X26BOlH34Be'
  plan = stripe_api_wrapper.create_plan(25)
  customer = stripe_api_wrapper.create_customer(token)
  stripe_api_wrapper.subscribe_customer_to_plan(customer, plan)
  erb :index, :layout => :nav
end

post '/your-charge-code' do
  token = params[:token]
  customer = stripe_api_wrapper.create_customer(token)

  erb :index, :layout => :nav
end

get '/auth/failure' do
  content_type 'text/plain'
  request.env['omniauth.auth'].to_hash.inspect rescue 'No Data'
end

get '/auth/:provider/callback' do
  auth_hash = request.env['omniauth.auth'].to_hash
  puts auth_hash.inspect rescue 'No Data'
  session[:email] = auth_hash['email']

  # check if user with email exists, if so, redirect to dashboard.
  # if not, create user with info and redirect to subscription setup.

  redirect to('/demo')
end
