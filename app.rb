require 'sinatra'
require 'sinatra/json'
require 'json'
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
  payload = JSON.parse(request.body.read)
  new_id = Time.now.to_i.to_s
  book = Book.new(id: new_id, title: payload['title'], author: payload['author'], status: payload['status'])
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
