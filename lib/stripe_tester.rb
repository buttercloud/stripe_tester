require "stripe_tester/version"
require 'uri'
require 'net/http'
require 'json'

module StripeTester

  LATEST_STRIPE_VERSION = "2013-07-05"

  # run callback with options to customize the json
  def self.create_event(callback_type, stripe_version=LATEST_STRIPE_VERSION, options={})
    webhook_data = self.load_template(callback_type, stripe_version)
    if webhook_data
      webhook_data = overwrite_attributes(webhook_data, options) unless options.empty?
      post_to_url(webhook_data)
      true
    end
  end

  # replace multiple values for multiple keys in a hash
  def self.overwrite_attributes(original_data, options={})
    data = original_data.clone
    if options
      options.each do |k,v|
        replace_value(data, k, v)
      end
    end
    data
  end

  # replaces a value for a single key in a hash
  def self.replace_value(hash, key, new_value)
    if hash.key?(key)
      hash[key] = new_value
    else
      hash.values.each do |value|
        value = value.first if value.is_a?(Array)
        replace_value(value, key, new_value) if value.is_a?(Hash)
      end
      hash
    end
  end

  def self.post_to_url(data={})
    post_url = webhook_url

    if post_url
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
    else
      raise "Could not post to URL. Please set URL."
    end
  end

  # load yaml with specified callback type
  def self.load_template(callback_type, version)
    spec = Gem::Specification.find_by_name("stripe_tester")
    gem_root = spec.gem_dir

    path = gem_root + "/stripe_webhooks/#{version}/#{callback_type}.yml"
    if File.exists?(path)
      template = Psych.load_file(path)
    else
      raise "Webhook not found. Please use a correct webhook type or correct stripe version"
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
