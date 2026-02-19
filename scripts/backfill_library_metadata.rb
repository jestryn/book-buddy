#!/usr/bin/env ruby

require 'yaml'
require 'net/http'
require 'uri'
require 'json'

FILE_PATH = File.expand_path('../data/library.yml', __dir__)
PROXY_BASE_URL = ENV.fetch('BOOKBUDDY_PROXY_BASE_URL', 'http://localhost:4567')

def fetch_json(uri)
  res = Net::HTTP.get_response(uri)
  return nil unless res.code.to_i == 200
  JSON.parse(res.body)
rescue StandardError
  nil
end

def fetch_volume(google_id)
  proxy_uri = URI("#{PROXY_BASE_URL}/api/google_books/volumes/#{URI.encode_www_form_component(google_id)}")
  payload = fetch_json(proxy_uri)
  return payload if payload

  uri = URI("https://www.googleapis.com/books/v1/volumes/#{URI.encode_www_form_component(google_id)}")
  fetch_json(uri)
end

def to_array(value)
  return value.compact.map(&:to_s) if value.is_a?(Array)
  return [value.to_s] if value.is_a?(String) && !value.empty?
  []
end

def strip_html(value)
  return nil unless value.is_a?(String)
  cleaned = value.gsub(/<[^>]*>/, ' ').gsub(/\s+/, ' ').strip
  cleaned.empty? ? nil : cleaned
end

def parse_metadata(payload)
  info = payload['volumeInfo'] || {}
  access = payload['accessInfo'] || {}
  sale = payload['saleInfo'] || {}
  ids = info['industryIdentifiers'].is_a?(Array) ? info['industryIdentifiers'] : []
  isbn10 = ids.find { |id| id['type'] == 'ISBN_10' }&.dig('identifier')
  isbn13 = ids.find { |id| id['type'] == 'ISBN_13' }&.dig('identifier')

  formats = []
  formats << info['printType'].to_s if info['printType']
  formats << 'EPUB' if access.dig('epub', 'isAvailable')
  formats << 'PDF' if access.dig('pdf', 'isAvailable')
  formats << 'Text' if info.dig('readingModes', 'text')
  formats << 'Image' if info.dig('readingModes', 'image')
  formats << 'eBook' if sale['isEbook']

  {
    description: strip_html(info['description']),
    publisher: info['publisher'],
    published_date: info['publishedDate'],
    page_count: info['pageCount'],
    isbn10: isbn10,
    isbn13: isbn13,
    language_codes: to_array(info['language']).map(&:upcase),
    categories: to_array(info['categories']),
    formats: formats.uniq,
    preview_link: info['previewLink']
  }
end

def missing_or_empty?(value)
  value.nil? || value == '' || (value.respond_to?(:empty?) && value.empty?)
end

library = YAML.load_file(FILE_PATH)
updated_count = 0

library.each do |entry|
  google_id = entry[:google_id] || entry['google_id']
  next if google_id.nil? || google_id.to_s.strip.empty?

  payload = fetch_volume(google_id.to_s)
  next unless payload

  metadata = parse_metadata(payload)
  changed = false

  metadata.each do |key, value|
    next if value.nil? || (value.respond_to?(:empty?) && value.empty?)
    if missing_or_empty?(entry[key])
      entry[key] = value
      changed = true
    end
  end

  if missing_or_empty?(entry[:language_codes])
    entry[:language_codes] = []
    changed = true
  end
  if missing_or_empty?(entry[:categories])
    entry[:categories] = []
    changed = true
  end
  if missing_or_empty?(entry[:formats])
    entry[:formats] = []
    changed = true
  end

  updated_count += 1 if changed
  sleep 0.15
end

File.write(FILE_PATH, library.to_yaml)
puts "Backfill complete. Updated #{updated_count} entr#{updated_count == 1 ? 'y' : 'ies'}."
