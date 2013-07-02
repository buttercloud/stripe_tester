require "stripe_tester/version"
require 'uri'
require 'net/http'
require 'json'

module StripeTester
	# when done test me
	# run callback with options to customize the json
	def self.create_event(callback_type, options={})
		data = self.load_template(callback_type)
		
		# TODO: change the default value of the json with the set options
		post_to_url(data)
	end

	def self.post_to_url(data={})
		post_url = webhook_url

		# set up request
		req = Net::HTTP::Post.new(post_url.path)
		req.content_type = 'application/json'
		req.body = data.to_json

		# send request
		res = Net::HTTP.start(post_url.hostname, post_url.port) do |http|
			http.request(req)
		end

		case res
		when Net::HTTPSuccess, Net::HTTPRedirection
			# good
		else
			res.value
		end
	end

	# load yaml with specified callback type
	def self.load_template(callback_type)
		template = Psych.load_file("./webhooks/#{callback_type}.yml")
	end

	# save the url and a URI object
	def self.webhook_url=(url)
		begin
			temp_url = URI.parse(url)
		rescue Exception => e
			puts "Could not parse URL -- #{e}"
			return
		end
		@url = temp_url
	end

	def self.webhook_url
		@url
	end
end
