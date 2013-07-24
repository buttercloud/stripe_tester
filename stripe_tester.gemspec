# coding: utf-8
lib = File.expand_path('../lib', __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)
require 'stripe_tester/version'

Gem::Specification.new do |spec|
  spec.name          = "stripe_tester"
  spec.version       = StripeTester::VERSION
  spec.authors       = ["Buttercloud"]
  spec.email         = ["info@buttercloud.com"]
  spec.description   = %q{Test Stripe webhooks locally}
  spec.summary       = %q{Test Stripe webhooks locally}
  spec.homepage      = "https://github.com/buttercloud/stripe_tester"
  spec.license       = "MIT"

  spec.files         = `git ls-files`.split($/)
  spec.executables   = spec.files.grep(%r{^bin/}) { |f| File.basename(f) }
  spec.test_files    = spec.files.grep(%r{^(test|spec|features)/})
  spec.require_paths = ["lib"]

  spec.required_ruby_version = '>= 1.9.3'
  spec.add_development_dependency "bundler", "~> 1.3"
  spec.add_development_dependency "rake"
  spec.add_development_dependency "rspec"
  spec.add_development_dependency "mocha"
  spec.add_development_dependency "fakeweb", "~> 1.3"
end
