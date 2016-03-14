require 'spec_helper'

describe StripeTester do

  describe "instance methods" do

    LATEST_STRIPE_VERSION = "2015-10-16"

    before(:each) do
      StripeTester.remove_url
    end

    after(:each) do
      StripeTester.stripe_version = nil
      StripeTester.verify_ssl = nil
    end

    it "#load_template should return hash" do
      result = StripeTester.load_template(:invoice_created)

      expect(result).to be_a_kind_of(Hash)
    end

    it "#load_template should return correct callback type" do
      type = "invoice_created"

      returned_hash = StripeTester.load_template(type)
      returned_type = returned_hash["type"]

      returned_type.sub!('.', '_')

      expect(returned_type).to eq(type)
    end

    it "#load_template should raise an exception when invalid event is given" do
      type = "incorrect_type"

      expect { StripeTester.load_template(type) }.to raise_error
    end

    it "#stripe_version should set the correct stripe version" do
      version = "2013-02-13"
      StripeTester.stripe_version = version

      expect(StripeTester.stripe_version).to eq version
    end

    it "#stripe_version should return the latest version when no version has been specified" do
      expect(StripeTester.stripe_version).to eq LATEST_STRIPE_VERSION
    end

    it "#webhook_url should set the correct url" do
      url = 'http://www.google.com'
      StripeTester.webhook_url = url

      result_url = StripeTester.webhook_url
      expect(result_url.to_s).to eq(url)
    end

    it "#webhook_url should set the correct url if authentication is provided in url itself" do
      url = 'http://abc:def@www.google.com'
      StripeTester.webhook_url = url

      result_url = StripeTester.webhook_url
      expect(result_url.to_s).to eq(url)
    end

    it "#webhook_url should have correct url when password is provided through webhook_password" do
      url = 'http://www.google.com'
      StripeTester.webhook_url = url
      StripeTester.webhook_password = 'password'

      result_url = StripeTester.webhook_url
      expect(result_url.to_s).to eq(url)
    end

    it "#verify_ssl should default to true" do
      result_verify = StripeTester.verify_ssl?
      expect(result_verify).to eq(true)
    end

    it "#verify_ssl should set the verify_ssl flag" do
      verify = false
      StripeTester.verify_ssl = verify

      expect(StripeTester.verify_ssl?).to eq(verify)
    end

    it "#webhook_url should store url as and URI object" do
      url = 'http://www.hello.com'
      StripeTester.webhook_url = url

      result_url = StripeTester.webhook_url
      expect(result_url).to be_a_kind_of(URI)
    end

    it "#webhook_url should not store URL when URL is invalid" do
      StripeTester.webhook_url = 'datatatat'
      expect(StripeTester.webhook_url).to eq(nil)
    end

    it "#post_to_url should return true when request is successful" do
      data = StripeTester.load_template(:invoice_created)
      url = "http://localhost:3000/transactions"
      StripeTester.webhook_url = url

      FakeWeb.register_uri(:post,
                           url,
                           body: data.to_json,
                           content_type: 'application/json')

      response = StripeTester.post_to_url(data)

      expect(response).to be_truthy
    end

    it "#post_to_url should return true when authentication is provided" do
      data = StripeTester.load_template(:invoice_created)
      url = "http://localhost:3000/transactions"
      StripeTester.webhook_url = url
      StripeTester.webhook_password='password'

      FakeWeb.register_uri(:post,
                           url,
                           body: data.to_json,
                           content_type: 'application/json')

      response = StripeTester.post_to_url(data)

      expect(response).to be_truthy
    end

    it "#post_to_url should return true when authentication is provided through url" do
      data = StripeTester.load_template(:invoice_created)
      url = "http://stripe:password@localhost:3000/transactions"
      StripeTester.webhook_url = url

      FakeWeb.register_uri(:post,
                           url,
                           body: data.to_json,
                           content_type: 'application/json')

      response = StripeTester.post_to_url(data)

      expect(response).to be_truthy
    end

    it "#post_to_url should raise an error when request fails" do
      data = StripeTester.load_template(:invoice_created)
      url = "http://localhost:3000/"
      StripeTester.webhook_url = url

      FakeWeb.register_uri(:post,
                           url,
                           body: data.to_json,
                           content_type: 'application/json',
                           status: ["404", "Not Found"])

      expect{ StripeTester.post_to_url(data) }.to raise_error('404 "Not Found"')
    end

    it "#post_to_url should raise an error if webhook URL is not set" do
      expect { StripeTester.post_to_url() }.to raise_error
    end

    it "#post_to_url should support HTTPS requests" do
      data = StripeTester.load_template(:invoice_created)
      url = "https://localhost:3000/pathname"
      StripeTester.webhook_url = url

      FakeWeb.register_uri(:post,
                           url,
                           body: data.to_json,
                           content_type: 'application/json')

      response = StripeTester.post_to_url(data)

      expect(response).to be_truthy
    end

    it "#post_to_url should support HTTPS without SSL verification" do
      data = StripeTester.load_template(:invoice_created)
      url = "https://localhost:3000/pathname"
      verify = false
      StripeTester.webhook_url = url
      StripeTester.verify_ssl = verify

      FakeWeb.register_uri(:post,
                           url,
                           body: data.to_json,
                           content_type: 'application/json')

      response = StripeTester.post_to_url(data)

      expect(response).to be_truthy
    end

    it "#overwrite_attributes should overwrite attributes in default data to custom data" do
      original_data = {name: 'john smith', info: {age: 45, gender: 'male'}}
      overwrite_data = {name: 'smith john', age: 99}

      new_data = StripeTester.overwrite_attributes(original_data, overwrite_data)

      expect(new_data[:name]).to eq(overwrite_data[:name])
      expect(new_data[:info][:age]).to eq(overwrite_data[:age])
    end

    it "#overwrite_attributes should return an unmodified hash when options don't exist" do
      original_data = {name: 'john smith', info: {age: 45, gender: 'male'}}

      new_data = StripeTester.overwrite_attributes(original_data)

      expect(new_data).to eq(original_data)
    end

    it "#replace_value should replace a value of a given key in the hash" do
      original_data = {name: 'john smith', info: {age: 45, gender: 'male'}}

      new_data = StripeTester.replace_value(original_data, :age, 99)

      expect(new_data[:info][:age]).to eq(99)
    end

    it "#merge_attributes should do a deep merge" do
      original_data = {name: 'john smith',
                       info: {age: 45,
                              gender: 'male',
                              occupation: {title: 'Software Developer',
                                           employer: 'ACME, Inc'},
                              address: {street: '123 Fake St',
                                        city: 'Somewhere',
                                        state: 'NC',
                                        zip: '12345'}}}
      new_data = StripeTester.merge_attributes(original_data, {name: 'jane smith', info: {gender: 'female', address: {city: 'Springfield'}}})
      expect(new_data[:name]).to eq('jane smith')
      expect(new_data[:info][:gender]).to eq('female')
      expect(new_data[:info][:age]).to eq(45)
      expect(new_data[:info][:address][:city]).to eq('Springfield')
      expect(new_data[:info][:address][:state]).to eq('NC')
    end
  end
end
