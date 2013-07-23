# StripeTester

Stripe tester is testing gem used to simulate Stripe webhooks and post them to a specified URL.

## Installation

Add this line to your application's Gemfile:

    gem 'stripe_tester'

And then execute:

    $ bundle

Or install it yourself as:

    $ gem install stripe_tester

## Usage

1. Set the URL
    StripeTester.webhook_url = "http://www.example.com/my_post_url"
2. Send the webhook. This will send the specified event to the set URL.
    StripeTester.create_event(:invoice_created)
or if you want to override certain attributes
    StripeTester.create_event(:invoice_created, {"amount" => 100, "currency" => 'gbp'})


## Contributing

1. Fork it
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request
