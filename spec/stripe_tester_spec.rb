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

		it "#load_template should return nil  when invalid event is given" do
			type = "incorrect_type"

			returned_hash = StripeTester.load_template(type)

			expect(returned_hash).to eq(nil)
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

		pending "#post_to_url should send data to url" do 
			
		end

		pending "#override_attributes should override attributes in default data to custom data" do
			original_data = {name: 'john smith', info: {age: 45, gender: 'male'}}
			options = {name: 'smith john', age: 99}

			StripeTester.override_attributes(original_data, options)

			age = original_data[:info][:age]
			expect(age).to eq(options[:age])
		end

		it "#find_value should find the value of any value in the hash" do
			original_data = StripeTester.load_template(:invoice_created)

			var = StripeTester.find_value(original_data, "url")
			expect(var).to eq("/v1/invoices/in_27H6EmDDBU0Xza/lines")
		end
	end
end