require "stripe_tester/version"

module StripeTester
	# when done test me
	# run callback with options to customize the json
	def self.create_event(callback_type, options={})
		event_json = self.load_template(callback_type)
		
		# TODO: change the default value of the json with the set options

		url = URI.parse(webhook_url)
		Net::HTTP.post_form(url, event_json)
	end

	# load yaml with specified callback type
	def self.load_template(callback_type)
		template = Psych.load_file("./webhooks/#{callback_type}.yml")
	end

	def self.webhook_url=(url)
		@url = url
	end

	def self.webhook_url
		@url
	end
end
