require 'letsencrypt-rails-heroku'
require 'omniauth'
require 'omniauth-google-oauth2'
require 'sinatra'
require 'sinatra/namespace'
require 'sinatra/sequel'
require './util/stripe_wrapper'

Letsencrypt.configure
use Letsencrypt::Middleware

configure :development do
  require 'better_errors'
  require 'pry'
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

not_found do
  status 404
  erb :oops
end

get '/' do
  erb :index, layout: :nav
end

get '/demo/:id' do
  erb :demo, layout: :nav
end

get '/demo/:id/text' do
  lesson = Lesson.where(category: 'demo').to_a[params[:id].to_i - 1]
  { text: lesson.text.strip, translation: lesson.translation, category: lesson.category }.to_json
end

get '/complete' do
  erb :complete, layout: :nav
end

get '/signup' do
  user = User.where(id: session[:id]).first
  user ? email = user[:email] : email = nil
  if ENV['RACK_ENV'] === 'production'
    stripe_public_key =  ENV['PROD_STRIPE_PUBLIC_KEY']
  else
    stripe_public_key = ENV['TEST_STRIPE_PUBLIC_KEY']
  end
  erb :signup, layout: :nav, locals: {email: email, stripe_public_key: stripe_public_key }
end

get '/category/:category' do
  authenticate!
  user = User.where(id: session[:id]).first
  lessons = Lesson.where(category: params[:category]).to_a.map do |lesson|
    {
      id: lesson.id,
      text: lesson.text,
      category: lesson.category,
      completed: user.lessons.any? {|user_lesson| lesson.id === user_lesson.id}
    }
  end
  erb :category, layout: :nav, locals: { lessons: lessons }
end

get '/categories' do
  authenticate!
  categories = Lesson.map(&:category).uniq.reject {|c| c === "demo"}
  difficulty = { 'conversation_i': 'Beginner', 'conversation_ii': 'Intermediate', 'literature': 'Expert', 'news': 'Advanced'}
  difficulties = {}
  categories.map { |category| difficulties[category] = difficulty[category.to_sym] }
  erb :categories, layout: :nav, locals: { categories: difficulties }
end

get '/lessons/:id' do
  authenticate!
  lesson = Lesson.where(id: params[:id]).first
  erb :lesson, layout: :nav, locals: { lesson: lesson }
end

post '/lessons/:id/completed' do
  authenticate!
  lesson = Lesson.where(id: params[:id]).first
  user = User.where(id: session[:id]).first
  user.add_lesson(lesson)
  lessons_users = LessonsUsers.where(user_id: user.id, lesson_id: lesson.id).first
  lessons_users.update(completed_at: DateTime.now)
end

get '/lessons/:id/text' do
  authenticate!
  lesson = Lesson.where(id: params[:id]).first
  { text: lesson.text.strip, translation: lesson.translation, category: lesson.category }.to_json
end

get '/translation/:id/:text' do
  authenticate!
  lesson = Lesson.where(id: params[:id]).first
  lesson.translation[params[:text]]
end

post '/charge' do
  token = params['stripeToken']
  amount = params[:amount]
  amount = '1.95' if amount.empty?
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

get '/supporters' do
  erb :supporters
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

namespace '/stats' do
  subscriptions = Stripe::Subscription.list()
  live = (ENV['RACK_ENV'] === 'production')
  live_subscriptions = subscriptions.to_a.select { |s| s.livemode === live }

  get '/amrpu' do
    mrr = live_subscriptions.reduce(0) { |sum, s| sum += s.plan.amount }
    amrpu = mrr / live_subscriptions.length
    format_cents(amrpu)
  end

  get '/minmax' do
    max = live_subscriptions.max_by { |s| s.plan.amount }.plan.amount
    min = live_subscriptions.min_by { |s| s.plan.amount }.plan.amount
    { max: format_cents(max), min: format_cents(min) }.to_json
  end
end

def authenticate!
  unless session[:id] && session[:token]
    redirect to('/')
  end
end

def format_cents(cents)
  '%.2f' % (cents.to_f / 100)
end
