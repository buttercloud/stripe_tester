require "stripe_tester/version"
require 'uri'
require 'net/http'
require 'json'

module StripeTester

	# hack to find the value of the nested key (returns only the first one found)
	def self.deep_fetch(hash, key, default = nil)
   default = yield if block_given?
   (deep_find(hash, key) or default) or raise KeyError.new("key not found: #{key}")
 	end

 	# TODO: check in array as well
 	def self.deep_find(hash, key)
		hash.key?(key) ? hash[key] : hash.values.inject(nil) do |memo, v|  
			v = v.first if v.is_a?(Array) # convert array to hash if any
			deep_find(v, key) if v.is_a?(Hash)
		end
  end

	# when done test me
	# run callback with options to customize the json
	def self.create_event(callback_type, options={})
		webhook_data = self.load_template(callback_type)
		
		override_attributes(webhook_data, options) unless options.empty?

		post_to_url(webhook_data)
	end

	def self.override_attributes(original_data, new_data)

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
		begin
			template = Psych.load_file("./webhooks/#{callback_type}.yml")
		rescue StandardError => e
			puts e
		end
	end

	# save the url and a URI object
	def self.webhook_url=(url)
		if url =~ /^#{URI::regexp}$/
			temp_url = URI.parse(url)
			@url = temp_url
		end
	end

	def self.webhook_url
		@url
	end

	def self.remove_url
		@url = nil
	end
end
