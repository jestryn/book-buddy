require 'sinatra'
require 'sinatra/json'
require 'json'
require 'securerandom'
require 'uri'
require 'net/http'
require_relative './models/library_entry'
require_relative './repositories/library_repository'

set :port, 4567
set :static, true
set :public_folder, File.expand_path('public', __dir__)
set :google_books_api_key, ENV['GOOGLE_BOOKS_API_KEY']

repo = LibraryRepository.new('./data/library.yml')
google_books_cache = {}
google_books_cache_ttl_seconds = 60 * 30

get '/' do
  send_file File.join(settings.public_folder, 'index.html')
end

get '/search' do
  send_file File.join(settings.public_folder, 'search.html')
end

get '/api/library' do
  library = repo.all
  json library.map(&:to_h)
end

post '/api/library' do
  request.body.rewind
  payload = JSON.parse(request.body.read)

  required_keys = %w[id title authors thumbnail] # id here is the Google Books volume ID
  halt 400, { error: 'Missing required fields' }.to_json unless required_keys.all? { |k| payload[k] && !payload[k].empty? }

  new_id = SecureRandom.uuid
  language_codes = payload['language_codes'].is_a?(Array) ? payload['language_codes'] : []
  categories = payload['categories'].is_a?(Array) ? payload['categories'] : []
  formats = payload['formats'].is_a?(Array) ? payload['formats'] : []

  book = LibraryEntry.new(
    id: new_id,
    google_id: payload['id'],            # Google Books volume ID
    title: payload['title'],
    authors: payload['authors'],
    thumbnail: payload['thumbnail'],
    status: 'unread',
    notes: '',
    rating: nil,
    progress: 0,
    added_date: Time.now.strftime('%Y-%m-%d'),
    description: payload['description'],
    publisher: payload['publisher'],
    published_date: payload['published_date'],
    page_count: payload['page_count'],
    isbn10: payload['isbn10'],
    isbn13: payload['isbn13'],
    language_codes: language_codes,
    categories: categories,
    formats: formats,
    preview_link: payload['preview_link']
  )

  repo.add(book)
  status 201
  json book.to_h
end

put '/api/library/:id' do
  payload = JSON.parse(request.body.read)
  updated = repo.update(params[:id], payload)
  halt 404, json({ error: 'Book not found' }) unless updated
  json updated.to_h
end

delete '/api/library/:id' do
  success = repo.delete(params[:id])
  halt 404, json({ error: 'Book not found' }) unless success
  status 204
end

get '/api/library/google_ids' do
  content_type :json
  json repo.all.map(&:google_id)
end

get '/api/google_books/search' do
  query = params['q'].to_s.strip
  halt 400, json({ error: 'Missing q parameter' }) if query.empty?

  cache_key = "search:#{query.downcase}"
  now = Time.now.to_i
  cached = google_books_cache[cache_key]
  fresh_cache = cached && (now - cached[:at] <= google_books_cache_ttl_seconds)
  return cached[:body] if fresh_cache

  uri = URI("https://www.googleapis.com/books/v1/volumes?q=#{URI.encode_www_form_component(query)}")
  params_out = URI.decode_www_form(uri.query || '')
  params_out << ['key', settings.google_books_api_key] if settings.google_books_api_key && !settings.google_books_api_key.empty?
  uri.query = URI.encode_www_form(params_out)

  response = Net::HTTP.get_response(uri)
  code = response.code.to_i
  content_type :json

  if code == 200
    google_books_cache[cache_key] = { at: now, body: response.body }
    return response.body
  end

  if code == 429 && cached
    headers 'X-BookBuddy-Cache' => 'stale'
    return cached[:body]
  end

  status code
  response.body
end

get '/api/google_books/volumes/:id' do
  google_id = params[:id].to_s.strip
  halt 400, json({ error: 'Missing volume id' }) if google_id.empty?

  cache_key = "volume:#{google_id}"
  now = Time.now.to_i
  cached = google_books_cache[cache_key]
  fresh_cache = cached && (now - cached[:at] <= google_books_cache_ttl_seconds)
  return cached[:body] if fresh_cache

  uri = URI("https://www.googleapis.com/books/v1/volumes/#{URI.encode_www_form_component(google_id)}")
  params_out = URI.decode_www_form(uri.query || '')
  params_out << ['key', settings.google_books_api_key] if settings.google_books_api_key && !settings.google_books_api_key.empty?
  uri.query = URI.encode_www_form(params_out)

  response = Net::HTTP.get_response(uri)
  code = response.code.to_i
  content_type :json

  if code == 200
    google_books_cache[cache_key] = { at: now, body: response.body }
    return response.body
  end

  if code == 429 && cached
    headers 'X-BookBuddy-Cache' => 'stale'
    return cached[:body]
  end

  status code
  response.body
end
