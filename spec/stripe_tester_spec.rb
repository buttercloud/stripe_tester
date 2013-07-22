require 'spec_helper'

describe StripeTester do

  describe "instance methods" do
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

    it "#webhook_url should set the default url for the class" do
      url = 'http://www.google.com'
      StripeTester.remove_url
      StripeTester.webhook_url = url

      result_url = StripeTester.webhook_url
      expect(result_url.to_s).to eq(url)
    end

    it "#webhook_url should store url as and URI object" do
      url = 'http://www.hello.com'
      StripeTester.remove_url
      StripeTester.webhook_url = url

      result_url = StripeTester.webhook_url
      expect(result_url).to be_a_kind_of(URI)
    end

    it "#webhook_url should not store URL when URL is invalid" do
      StripeTester.remove_url
      StripeTester.webhook_url = 'datatatat'
      expect(StripeTester.webhook_url).to eq(nil)
    end

    it "#post_to_url should send data to url" do
    end

    it "#post_to_url should raise an error if webhook URL is not set" do
      StripeTester.remove_url
      expect { StripeTester.post_to_url() }.to raise_error
    end

    it "#override_attributes should override attributes in default data to custom data" do
      original_data = {name: 'john smith', info: {age: 45, gender: 'male'}}
      override_data = {name: 'smith john', age: 99}

      new_data = StripeTester.override_attributes(original_data, override_data)

      expect(new_data[:name]).to eq(override_data[:name])
      expect(new_data[:info][:age]).to eq(override_data[:age])
    end

    it "#override_attributes should return an unmodified hash when options don't exist" do
      original_data = {name: 'john smith', info: {age: 45, gender: 'male'}}

      new_data = StripeTester.override_attributes(original_data)

      expect(new_data).to eq(original_data)
    end

    it "#replace_value should replace a value of a given key in the hash" do
      original_data = {name: 'john smith', info: {age: 45, gender: 'male'}}

      new_data = StripeTester.replace_value(original_data, :age, 99)

      expect(new_data[:info][:age]).to eq(99)
    end

    it "#create_event should send the event to the URL with the modified hash if options exist" do
      
    end

    it "#create_event should send the event with an unmodified hash to the URL if options don't exist" do
      
    end
  end
end