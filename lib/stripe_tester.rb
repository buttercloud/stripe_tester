require "stripe_tester/version"
require 'uri'
require 'net/http'
require 'json'
require 'psych'

module StripeTester

  LATEST_STRIPE_VERSION = "2015-10-01"

  # send the url the webhook event
  # There are two options you can use.  :method=>:overwrite, or :method=>:merge
  # Each will use a different way of merging the new attributes.
  def self.create_event(callback_type, attributes={}, options={method: :overwrite})
    webhook_data = self.load_template(callback_type, attributes, options)
    
    post_to_url(webhook_data) if webhook_data
  end

  # replace multiple values for multiple keys in a hash
  def self.overwrite_attributes(original_data, attributes={})
    data = original_data.clone
    if attributes
      attributes.each do |k,v|
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

  # deep merge original_attributes with new_attributes
  def self.merge_attributes(original_attributes, new_attributes={})
    original_attributes = original_attributes.clone
    if new_attributes
      new_attributes.each do |key, value|
        if value.is_a?(Hash) && original_attributes[key].is_a?(Hash)
          original_attributes[key] = self.merge_attributes original_attributes[key], value
        else
          original_attributes[key] = value
        end
      end
    end
    original_attributes
  end

  def self.post_to_url(data={})
    post_url = webhook_url

    if post_url
      # set up request
      req = Net::HTTP::Post.new(post_url.path)
      req.content_type = 'application/json'
      req.body = data.to_json

      http_object = Net::HTTP.new(post_url.hostname, post_url.port)
      http_object.use_ssl = true if post_url.scheme == 'https'

      # send request
      res = http_object.start do |http|
        http.request(req)
      end

      case res
      when Net::HTTPSuccess, Net::HTTPRedirection
        true
      else
        res.value
      end
    else
      raise "Could not post to URL. Please set URL."
    end
  end

  # load yaml with specified callback type
  def self.load_template(callback_type, attributes={}, options={method: :overwrite})
    spec = Gem::Specification.find_by_name("stripe_tester")
    gem_root = spec.gem_dir
    version = StripeTester.stripe_version

    path = gem_root + "/stripe_webhooks/#{version}/#{callback_type}.yml"
    if File.exists?(path)
      template = Psych.load_file(path)

      unless attributes.empty?
        if options[:method] == :merge
          template = merge_attributes(template, attributes)
        else
          template = overwrite_attributes(template, attributes)
        end
      end

      return template
    else
      raise "Webhook not found. Please use a correct webhook type or correct Stripe version"
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

  def self.stripe_version=(version)
    @version = version
  end

  def self.stripe_version
    @version ? @version : LATEST_STRIPE_VERSION
  end
end
