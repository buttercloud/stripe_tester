# StripeTester

[![wercker status](https://app.wercker.com/status/b7beba8a128a081bdeec003a15aafbaa "wercker status")](https://app.wercker.com/project/bykey/b7beba8a128a081bdeec003a15aafbaa)

StripeTester is a testing gem used to simulate Stripe webhooks and post them to a specified URL.

StripeTester allows you to submit webhooks to your application without hitting Stripe or requiring connectivity. You can use it in your test suite to simulate webhooks and ensure that your application reacts accordingly. You can also use StripeTester in the console to simulate webhooks easily.

## Installation

Add this line to your application's Gemfile:
```ruby
gem 'stripe_tester', '~> 0.0.5'
```
And then execute:
```bash
$ bundle
```
Or install it yourself as:
```bash
$ gem install stripe_tester
```

## Requirements

Ruby `>= 1.9.3`

RSpec

## Usage

In your test:

1. Set the URL where the webhooks are handled:
```ruby
    StripeTester.webhook_url = "http://www.example.com/my_post_url"
```

2. If you want to specify which Stripe webhook API version you would like to use (the default will be the latest [supported version](https://github.com/buttercloud/stripe_tester#supported-stripe-webhook-api-versions)):
```ruby
    StripeTester.stripe_version = "2013-09-08"
```

3. Send the webhook. This will send a POST request to the URL with the event data as JSON:
```ruby
    # as a symbol
    StripeTester.create_event(:invoice_created)
        
    # or as a string
    StripeTester.create_event("invoice_created")
```

  Or if you want to overwrite certain attributes globally:
```ruby
StripeTester.create_event(:invoice_created, {"amount" => 100, "currency" => 'gbp'})
```

  Or you can explicitly overwrite certain attributes using deep object merging:
```ruby
StripeTester.create_event(:customer_subscription_created, {"data"=>{"object"=>{"plan"=>{"id"=>"gold-v1"}}}}, :method=>:merge)
```

  If you want to load the JSON only:
```ruby
json = StripeTester.load_template(:invoice_payment_failed)
```

## Supported Webhooks 

Version 2013-07-05:

* charge_failed
* charge_refunded
* charge_succeeded
* customer_created
* customer_deleted
* customer_subscription_created
* customer_subscription_deleted
* customer_subscription_updated
* customer_subscription_trial_will_end
* invoice_created
* invoice_payment_failed
* invoice_payment_succeeded
* invoice_updated

Version 2013-08-13:

* account.updated
* balance.available
* charge.dispute.closed
* charge.dispute.created
* charge.dispute.updated
* charge.failed
* charge.refunded
* charge.succeeded
* coupon.created
* coupon.deleted
* customer.card.created
* customer.card.deleted
* customer.card.updated
* customer.created
* customer.deleted
* customer.discount.created
* customer.discount.deleted
* customer.discount.updated
* customer.subscription.created
* customer.subscription.deleted
* customer.subscription.trial_will_end
* customer.subscription.updated
* customer.updated
* invoice.created
* invoice.payment_failed
* invoice.payment_succeeded
* invoice.updated
* invoiceitem.created
* invoiceitem.deleted
* invoiceitem.updated
* plan.created
* plan.deleted
* plan.updated
* transfer.created
* transfer.failed
* transfer.paid
* transfer.updated

## Supported Stripe Webhook API Versions

* 2013-08-13
* 2013-07-05
* 2013-02-13

## Contributing

* Fork it
* Create your feature branch
* Add your changes, and add a test for the changes.
* Run tests using

```bash 
  $ rspec spec
```
* Make sure everything is passing
* Push to the branch
* Create a new Pull Request

## License

Copyright (c) 2013 ButterCloud LLC.

MIT License

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
