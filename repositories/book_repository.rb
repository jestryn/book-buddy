require 'yaml'
require_relative '../models/book'

class BookRepository

  def initialize(file_path)
    @file_path = file_path
    @books = load_books
  end

  def all
    @books
  end

  def find(id)
    @books.find { |b| b.id == id }
  end

  def add(book)
    @books << book
    save_books
  end

  def update(id, attrs)
    book = find(id)
    return unless book
    attrs.each { |k, v| book.send("#{k}=", v) if book.respond_to?("#{k}=") }
    save_books
  end

  def delete(id)
    @books.reject! { |b| b.id == id }
    save_books
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
