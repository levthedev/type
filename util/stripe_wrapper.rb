require 'stripe'
require 'securerandom'

class StripeWrapper
  def initialize()
    Stripe.api_key = ENV['TEST_STRIPE_PRIVATE_KEY']
  end

  def create_plan(amount)
    Stripe::Plan.create(
      name: "Custom Test Plan - #{amount}",
      id: "#{amount}-daily-#{SecureRandom.hex}",
      interval: 'month',
      currency: 'usd',
      amount: amount,
    )
  end

  def create_customer(token, session)
    customer = nil
    begin
      customer = Stripe::Customer.retrieve(token)
    rescue Stripe::InvalidRequestError => e
      puts 'errored out'
      puts e
      puts session[:id]
      puts DB.from(:users).where(id: session[:id]).first
      email = DB.from(:users).where(id: session[:id]).first[:email]
      customer = Stripe::Customer.create(
        description: email || 'No description given',
        source: token
      )
    end
    customer
  end

  def subscribe_customer_to_plan(customer, plan, session)
    subscription = Stripe::Subscription.create(
      customer: customer.id,
      plan: plan.id
    )
    user = DB.from(:users).where(id: session[:id]).update(subscription: subscription.id, plan: plan.id, plan_amount: plan.amount, subscribed: true)
  end
end
