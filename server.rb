require 'sinatra'
require 'sinatra/sequel'
require 'omniauth'
require 'omniauth-google-oauth2'
require 'google/cloud/translate'
require './util/stripe_wrapper'

configure :development do
  require 'better_errors'
  use BetterErrors::Middleware
  BetterErrors.application_root = __dir__
end

configure do
	DB = Sequel.connect(ENV['DATABASE_URL'])
end

enable :sessions
set :session_secret, ENV['SESSION_SECRET']

use OmniAuth::Builder do
  provider :google_oauth2, ENV['GOOGLE_CLIENT_ID'], ENV['GOOGLE_CLIENT_SECRET'], {access_type: 'offline', prompt: 'consent', scope: 'userinfo.email'}
end

stripe_api_wrapper = StripeWrapper.new()

get '/' do
  erb :index, :layout => :nav
end

get '/demo' do
  erb :demo, :layout => :nav
end

get '/signup' do
  erb :signup, :layout => :nav
end

get '/subscription/:amount/:token' do
  amount = params[:amount]
  token = params[:token]
  plan = stripe_api_wrapper.create_plan(amount)
  customer = stripe_api_wrapper.create_customer(token)
  stripe_api_wrapper.subscribe_customer_to_plan(customer, plan)

  erb :index, :layout => :nav
end

post '/charge' do
  token = params['stripeToken']
  customer = stripe_api_wrapper.create_customer(token)
  plan = stripe_api_wrapper.create_plan(params[:amount] || 69)
  stripe_api_wrapper.subscribe_customer_to_plan(customer, plan, session)
  redirect to('/demo')
  erb :demo, :layout => :nav
end

get '/auth/failure' do
  content_type 'text/plain'
  request.env['omniauth.auth'].to_hash.inspect rescue 'No Data - It is possible your organization does not allow Google OAuth 2.0 access. Please contact us through the chat form on the website for more help.'
end

get '/auth/:provider/callback' do
  auth_hash = request.env['omniauth.auth'].to_hash
  email = auth_hash['info']['email']
  first_name = auth_hash['info']['first_name']

  users = DB.from(:users)
  user = users.where(email: email).limit(1).first

  if user && user[:subscribed]
    session[:id] = user[:id]
    redirect to('/demo')
  elsif user
    session[:id] = user[:id]
    redirect to('/signup')
  else
    user_id = users.insert(email: email, first_name: first_name, subscribed: false)
    session[:id] = user_id
    redirect to('/signup')
  end
end

get '/translate/:text' do
  # translate = Google::Cloud::Translate.new
  # translation = translate.translate(params[:text], to: 'en')
  # puts translation.text
  # translation.text
end
