require 'sinatra'
require 'sinatra/json'
require 'json'
require_relative './models/book'
require_relative './repositories/book_repository'

set :port, 4567
repo = BookRepository.new('./data/books.yml')

get '/' do
  'Welcome to BookBuddy API'
end

get '/api/books' do
  books = repo.all
  json books.map(&:to_h)
end

post '/api/books' do
  payload = JSON.parse(request.body.read)
  new_id = Time.now.to_i.to_s
  book = Book.new(id: new_id, title: payload['title'], author: payload['author'], status: payload['status'])
  repo.add(book)
  status 201
  json book.to_h
end

put '/api/books/:id' do
  payload = JSON.parse(request.body.read)
  updated = repo.update(params[:id], payload)
  halt 404, json({ error: 'Book not found' }) unless updated
  json updated.to_h
end

delete '/api/books/:id' do
  success = repo.delete(params[:id])
  halt 404, json({ error: 'Book not found' }) unless success
  status 204
end
