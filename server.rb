require 'google/cloud/translate'
require 'google/api_client/client_secrets'
require 'sinatra'
require 'pry'
require 'net/http'
require './util/api_wrapper'

enable :sessions
set :session_secret, ENV['SESSION_SECRET']

translate = Google::Cloud::Translate.new

stripe_api_wrapper = ApiWrapper.new()

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
  token = "cus_9q8X26BOlH34Be"
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

get '/test-auth' do
  auth_uri = auth_client.authorization_uri.to_s
  redirect to(auth_uri)
end

get '/app' do
  unless session.has_key?(:credentials)
   redirect to('/oauth2callback')
  end
  erb :demo, :layout => :nav
end

get '/oauth2callback' do
  json_secrets = JSON.parse(ENV['GOOGLE_CLIENT_SECRETS'])
  client_secrets = Google::APIClient::ClientSecrets.new(json_secrets)
  auth_client = client_secrets.to_authorization
  auth_client.update!(
    scope: 'email',
    redirect_uri: 'https://typelang.herokuapp.com/oauth2callback'
  )
  if request['code'] == nil
    auth_uri = auth_client.authorization_uri.to_s
    redirect to(auth_uri)
  else
    auth_client.code = request['code']
    auth_client.fetch_access_token!
    auth_client.client_secret = nil
    session[:credentials] = auth_client.to_json
    stripe_api_wrapper.check_for_subscription()
    redirect to('/')
  end
end

get '/creds' do
  session[:credentials]
end

get '/auth' do
  uri = URI("https://www.googleapis.com/oauth2/v1/userinfo?access_token=#{session[:credentials]['access_token']}")
  profile = Net::HTTP.get(uri)
  puts profile
end
