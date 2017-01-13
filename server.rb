require 'sinatra'
require 'sinatra/sequel'
require 'omniauth'
require 'omniauth-google-oauth2'
require './util/stripe_wrapper'

configure :development do
  require 'better_errors'
  use BetterErrors::Middleware
  BetterErrors.application_root = __dir__
end

configure do
	DB = Sequel.connect(ENV['DATABASE_URL'])
  DB.extension :pg_json
  require './util/models'
end

enable :sessions
set :session_secret, ENV['SESSION_SECRET']

use Rack::Deflater

use OmniAuth::Builder do
  provider :google_oauth2, ENV['GOOGLE_CLIENT_ID'], ENV['GOOGLE_CLIENT_SECRET'], {prompt: 'consent'}
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

get '/category/:category' do
  lessons = Lesson.where(category: params[:category]).to_a
  erb :category, :layout => :nav, locals: { lessons: lessons }
end

get '/categories' do
  categories = Lesson.map(&:category).uniq
  erb :categories, :layout => :nav, locals: { categories: categories }
end

get '/lessons/:id' do
  lesson = Lesson.where(id: params[:id]).first
  erb :lesson, :layout => :nav, locals: { lesson: lesson }
end

get '/translation/:id/:text' do
  lesson = Lesson.where(id: params[:id]).first
  translation = lesson.translation[params[:text]]
end

get '/lessons/:id/text' do
  lesson = Lesson.where(id: params[:id]).first
  { text: lesson.text.strip, translation: lesson.translation }.to_json
end

post '/charge' do
  token = params['stripeToken']
  amount = params[:amount]
  amount = Float(amount.gsub('$', '').gsub(',', '')).round(2)
  amount = (amount * 100).to_i
  amount = 100 if amount < 100
  begin
    customer = stripe_api_wrapper.create_customer(token, session)
    plan = stripe_api_wrapper.create_plan(amount || 100)
    stripe_api_wrapper.subscribe_customer_to_plan(customer, plan, session)
    redirect to('/categories')
  rescue StandardError => e
    puts "Error when charging: #{e}"
    redirect to('/')
  end
end

get '/auth/failure' do
  content_type 'text/plain'
  request.env['omniauth.auth'].to_hash.inspect rescue 'No Data - It is possible your organization does not allow Google OAuth 2.0 access. Please contact us through the chat form on the website for more help.'
end

get '/auth/:provider/callback' do
  auth_hash = request.env['omniauth.auth'].to_hash
  email = auth_hash['info']['email']
  first_name = auth_hash['info']['first_name']
  session[:token] = auth_hash['credentials']['token']

  users = DB.from(:users)
  user = users.where(email: email).limit(1).first

  if user && user[:subscribed]
    session[:id] = user[:id]
    redirect to('/categories')
  elsif user
    session[:id] = user[:id]
    redirect to('/signup')
  else
    user_id = users.insert(email: email, first_name: first_name, subscribed: false)
    session[:id] = user_id
    redirect to('/signup')
  end
end

get '/logout' do
  uri = URI('https://accounts.google.com/o/oauth2/revoke')
  params = { token: session[:token] }
  uri.query = URI.encode_www_form(params)
  response = Net::HTTP.get(uri)
  session.delete(:id)
  session.delete(:token)
  redirect to('/')
end
