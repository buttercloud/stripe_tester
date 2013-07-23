# StripeTester

Stripe tester is testing gem used to simulate Stripe webhooks and post them to a specified URL.

## Installation
---------------

Add this line to your application's Gemfile:

    gem 'stripe_tester'

And then execute:

    $ bundle

Or install it yourself as:

    $ gem install stripe_tester

## Usage
--------
In your test:

1. Set the URL:

       StripeTester.webhook_url = "http://www.example.com/my_post_url"
2. Send the webhook. This will send a POST request to the URL with the event data as JSON:

       # as a symbol
       StripeTester.create_event(:invoice_created)
        
       # or as a string
       StripeTester.create_event("invoice_created")
or if you want to overwrite certain attributes:

      StripeTester.create_event(:invoice_created, {"amount" => 100, "currency" => 'gbp'})

## Supported Webhooks
---------------------

* charge_failed
* charge_refunded
* charge_succeeded
* customer_created
* customer_deleted
* customer_subscription_created
* customer_subscription_deleted
* customer_subscription_updated
* invoice_created
* invoice_payment_failed
* invoice_payment_succeeded
* invoice_updated

## Issues
---------


## To-Do
--------


## Contributing
---------------

1. Fork it
2. Create your feature branch
3. Commit your changes
4. Run tests using `rspec spec` or `bundle exec rspec spec` and make sure everything is passing
5. Push to the branch
6. Create a new Pull Request
