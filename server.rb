require 'sinatra'
require 'sinatra/sequel'
require 'omniauth'
require 'omniauth-google-oauth2'
require './util/stripe_wrapper'

configure :development do
  require 'better_errors'
  require 'rack-mini-profiler'
  require 'memory_profiler'
  require 'flamegraph'

  use Rack::MiniProfiler
  use BetterErrors::Middleware
  BetterErrors.application_root = __dir__
end

configure do
	DB = Sequel.connect(ENV['DATABASE_URL'])
  DB.extension :pg_json
end

enable :sessions
set :session_secret, ENV['SESSION_SECRET']

use Rack::Deflater

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

post '/charge' do
  token = params['stripeToken']
  amount = params[:amount]
  puts amount
  puts amount.class
  amount = Float(amount.gsub('$', '').gsub(',', '')).round(2)
  amount = (amount * 100).to_i
  amount = 100 if amount < 100
  begin
    customer = stripe_api_wrapper.create_customer(token, session)
    plan = stripe_api_wrapper.create_plan(amount || 100)
    stripe_api_wrapper.subscribe_customer_to_plan(customer, plan, session)
  rescue StandardError => e
    puts "Error when charging: #{e}"
  end
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
