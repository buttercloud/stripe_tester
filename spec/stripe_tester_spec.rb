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

		it "#webhook_url should set the default url for the class" do
			url = 'http://www.google.com'
			StripeTester.webhook_url = url

			result_url = StripeTester.webhook_url
			expect(result_url.to_s).to eq(url)
		end

		it "#webhook_url should store url as and URI object" do
			url = 'http://www.google.com'
			StripeTester.webhook_url = url

			result_url = StripeTester.webhook_url
			expect(result_url).to be_a_kind_of(URI)
		end

		pending "#webhook_url should raise exception when URL is invalid" do
		end

		pending "#post_to_url should send data to url" do 
		end
	end
end