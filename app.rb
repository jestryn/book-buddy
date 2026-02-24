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
set :public_folder, File.expand_path('bookbuddy-ui/dist', __dir__)
set :google_books_api_key, ENV['GOOGLE_BOOKS_API_KEY']

repo = LibraryRepository.new('./data/library.yml')
google_books_cache = {}
google_books_cache_ttl_seconds = 60 * 30

helpers do
  def google_books_quota_exceeded?(status_code, body)
    return true if status_code.to_i == 429
    return false unless status_code.to_i == 403

    parsed = JSON.parse(body.to_s)
    reasons = (parsed.dig('error', 'errors') || []).map { |e| e['reason'].to_s.downcase }
    message = parsed.dig('error', 'message').to_s.downcase

    reasons.any? { |reason| reason.include?('quota') || reason.include?('ratelimit') || reason.include?('dailylimit') } ||
      message.include?('quota')
  rescue JSON::ParserError
    false
  end

  def open_library_google_item(doc)
    work_key = doc['key'].to_s
    normalized_work_key = work_key.gsub(%r{[^A-Za-z0-9_-]}, '_')
    item_id = "openlibrary:#{normalized_work_key.empty? ? SecureRandom.uuid : normalized_work_key}"
    cover_id = doc['cover_i']
    thumbnail = cover_id ? "https://covers.openlibrary.org/b/id/#{cover_id}-M.jpg" : nil
    raw_isbns = doc['isbn'].is_a?(Array) ? doc['isbn'] : []
    normalized_isbns = raw_isbns.map { |isbn| isbn.to_s.gsub(/[^0-9Xx]/, '').upcase }.uniq
    isbn10 = normalized_isbns.find { |isbn| isbn.match?(/\A[0-9X]{10}\z/) }
    isbn13 = normalized_isbns.find { |isbn| isbn.match?(/\A[0-9]{13}\z/) }
    identifiers = []
    identifiers << { 'type' => 'ISBN_10', 'identifier' => isbn10 } if isbn10
    identifiers << { 'type' => 'ISBN_13', 'identifier' => isbn13 } if isbn13

    {
      'id' => item_id,
      'volumeInfo' => {
        'title' => doc['title'] || 'Untitled',
        'authors' => (doc['author_name'].is_a?(Array) ? doc['author_name'] : []),
        'imageLinks' => thumbnail ? { 'thumbnail' => thumbnail, 'smallThumbnail' => thumbnail } : {},
        'description' => nil,
        'publisher' => (doc['publisher'].is_a?(Array) ? doc['publisher'].first : doc['publisher']),
        'publishedDate' => doc['first_publish_year']&.to_s,
        'pageCount' => nil,
        'industryIdentifiers' => identifiers,
        'language' => (doc['language'].is_a?(Array) ? doc['language'].first(5) : []),
        'categories' => (doc['subject'].is_a?(Array) ? doc['subject'].first(6) : []),
        'previewLink' => work_key.empty? ? nil : "https://openlibrary.org#{work_key}",
        'printType' => 'BOOK',
        'readingModes' => { 'text' => true, 'image' => !thumbnail.nil? }
      },
      'accessInfo' => {
        'epub' => { 'isAvailable' => false },
        'pdf' => { 'isAvailable' => false }
      },
      'saleInfo' => { 'isEbook' => false }
    }
  end

  def search_open_library(query)
    uri = URI('https://openlibrary.org/search.json')
    uri.query = URI.encode_www_form([['q', query], ['limit', '20']])
    response = Net::HTTP.get_response(uri)
    return nil unless response.code.to_i == 200

    data = JSON.parse(response.body)
    docs = data['docs'].is_a?(Array) ? data['docs'] : []
    items = docs.map { |doc| open_library_google_item(doc) }
    {
      'kind' => 'books#volumes',
      'totalItems' => items.length,
      'items' => items
    }
  rescue JSON::ParserError, StandardError
    nil
  end
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
    started_reading_date: nil,
    finished_reading_date: nil,
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
  existing = repo.find(params[:id])
  halt 404, json({ error: 'Book not found' }) unless existing

  if payload.key?('status')
    today = Time.now.strftime('%Y-%m-%d')

    case payload['status']
    when 'unread'
      payload['started_reading_date'] = nil unless payload.key?('started_reading_date')
      payload['finished_reading_date'] = nil unless payload.key?('finished_reading_date')
    when 'reading'
      payload['started_reading_date'] = existing.started_reading_date || today unless payload.key?('started_reading_date')
      payload['finished_reading_date'] = nil unless payload.key?('finished_reading_date')
    when 'completed'
      payload['started_reading_date'] = existing.started_reading_date || today unless payload.key?('started_reading_date')
      payload['finished_reading_date'] = existing.finished_reading_date || today unless payload.key?('finished_reading_date')
    end
  end

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

  if google_books_quota_exceeded?(code, response.body)
    fallback = search_open_library(query)
    if fallback
      headers 'X-BookBuddy-Provider' => 'openlibrary'
      headers 'X-BookBuddy-Fallback' => 'google-books-quota-exceeded'
      return fallback.to_json
    end
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

get '/' do
  send_file File.join(settings.public_folder, 'index.html')
end

# SPA fallback: non-API frontend routes should load React index.html
get '/*' do
  pass if request.path_info.start_with?('/api/')
  pass if request.path_info.include?('.')
  send_file File.join(settings.public_folder, 'index.html')
end
