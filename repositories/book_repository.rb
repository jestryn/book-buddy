require 'yaml'
require_relative '../models/book'

class BookRepository

  def initialize(file_path)
    @file_path = file_path
  end

  def all
    load_books
  end

  def find(id)
    load_books.find { |b| b.id == id }
  end

  def add(book)
    books = load_books
    books << book
    save_books(books)
  end

  def update(id, attrs)
    books = load_books
    book = books.find { |b| b.id == id }
    return unless book

    attrs.each { |k, v| book.send("#{k}=", v) if book.respond_to?("#{k}=") }
    save_books(books)
    book
  end

  def delete(id)
    books = load_books
    original_size = books.size
    books.reject! { |b| b.id == id }
    changed = books.size != original_size
    save_books(books) if changed
    changed
  end

  private

  # Uses rescue for clean file-not-found handling
  # Uses transform_keys(&:to_sym) to ensure compatibility with keyword arguments in Book.new
  def load_books
    YAML.load_file(@file_path).map { |data| Book.new(**data.transform_keys(&:to_sym)) }
  rescue Errno::ENOENT
    []
  end

  # Keeps save_books stateless and reusable
  def save_books(books)
    File.write(@file_path, books.map(&:to_h).to_yaml)
  end

end
