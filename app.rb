require 'sinatra'
require 'sinatra/json'
require 'json'
require 'securerandom'
require_relative './models/library_entry'
require_relative './repositories/library_repository'

set :port, 4567
set :static, true
set :public_folder, File.expand_path('public', __dir__)

repo = LibraryRepository.new('./data/library.yml')

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
  book = LibraryEntry.new(
    id: new_id,
    google_id: payload['id'],            # Google Books volume ID
    title: payload['title'],
    authors: payload['authors'],
    thumbnail: payload['thumbnail'],
    status: 'unread',
    added_date: Time.now.strftime('%Y-%m-%d')
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
