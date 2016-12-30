require 'stripe'
require 'securerandom'

class ApiWrapper
  def initialize()
    Stripe.api_key = ENV['TEST_STRIPE_PRIVATE_KEY']
  end

  def create_plan(amount)
    Stripe::Plan.create(
      name: "Custom Test Plan - #{amount}",
      id: "#{amount}-daily-#{SecureRandom.hex}",
      interval: 'day',
      currency: 'usd',
      amount: amount,
    )
  end

  def create_customer(token, description='No description given')
    customer = Stripe::Customer.retrieve(token)
    unless customer
      customer = Stripe::Customer.create(
        description: description,
        source: token
      )
    end
    customer
  end

  def subscribe_customer_to_plan(customer, plan)
    Stripe::Subscription.create(
      customer: customer.id,
      plan: plan.id
    )
  end
end
