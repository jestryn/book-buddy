require 'yaml'
require_relative '../models/library_entry'

class LibraryRepository

  def initialize(file_path)
    @file_path = file_path
  end

  def all
    load_library
  end

  def find(id)
    load_library.find { |b| b.id == id }
  end

  def add(book)
    library = load_library
    library << book
    save_library(library)
  end

  def update(id, attrs)
    library = load_library
    book = library.find { |l| l.id == id }
    return unless book

    attrs.each { |k, v| book.send("#{k}=", v) if book.respond_to?("#{k}=") }
    save_library(library)
    book
  end

  def delete(id)
    library = load_library
    original_size = library.size
    library.reject! { |b| b.id == id }
    changed = library.size != original_size
    save_library(library) if changed
    changed
  end

  private

  # Uses rescue for clean file-not-found handling
  # Uses transform_keys(&:to_sym) to ensure compatibility with keyword arguments in LibraryEntry.new
  def load_library
    YAML.load_file(@file_path).map { |data| LibraryEntry.new(**data.transform_keys(&:to_sym)) }
  rescue Errno::ENOENT
    []
  end

  # Keeps save_library stateless and reusable
  def save_library(library)
    File.write(@file_path, library.map(&:to_h).to_yaml)
  end

end
