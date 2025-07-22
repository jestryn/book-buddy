require 'sinatra'
require 'sinatra/json'
require 'yaml'
require_relative './models/book'

BOOKS_FILE = './data/books.yml'

# Helper to load and save
def load_books
  return [] unless File.exist?(BOOKS_FILE)
  YAML.load_file(BOOKS_FILE).map { |data| Book.new(**data) }
end

def save_books(books)
  File.write(BOOKS_FILE, books.map(&:to_h).to_yaml)
end

# Routes

get '/' do
  'Welcome to BookBuddy API'
end

get '/api/books' do
  books = load_books
  json books.map(&:to_h)
end

post '/api/books' do
  payload = JSON.parse(request.body.read)
  book = Book.new(title: payload['title'], author: payload['author'], status: payload['status'])
  books = load_books
  books << book
  save_books(books)
  status 201
  json book.to_h
end

put '/api/books/:id' do
  books = load_books
  book = books.find { |b| b.id == params[:id] }
  halt 404, json({ error: 'Book not found' }) unless book

  payload = JSON.parse(request.body.read)
  book.status = payload['status'] if payload['status']
  save_books(books)
  json book.to_h
end

delete '/api/books/:id' do
  books = load_books
  books.reject! { |b| b.id == params[:id] }
  save_books(books)
  status 204
end
