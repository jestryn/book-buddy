# models/library_entry.rb
require 'securerandom'

class LibraryEntry
  attr_accessor :id, :google_id, :title, :authors, :thumbnail, :status, :notes, :added_date, :rating, :progress,
                :description, :publisher, :published_date, :page_count, :isbn10, :isbn13, :language_codes, :categories,
                :formats, :preview_link

  def initialize(id: nil, google_id: nil, title:, authors:, thumbnail: nil, status: 'unread', notes: "", added_date: nil,
                 rating: nil, progress: 0, description: nil, publisher: nil, published_date: nil, page_count: nil,
                 isbn10: nil, isbn13: nil, language_codes: [], categories: [], formats: [], preview_link: nil)
    @id = id
    @google_id = google_id
    @title = title
    @authors = authors
    @thumbnail = thumbnail
    @status = status
    @notes = notes
    @added_date = added_date
    @rating = rating
    @progress = progress
    @description = description
    @publisher = publisher
    @published_date = published_date
    @page_count = page_count
    @isbn10 = isbn10
    @isbn13 = isbn13
    @language_codes = language_codes || []
    @categories = categories || []
    @formats = formats || []
    @preview_link = preview_link
  end

  def to_h
    {
      id: id,
      google_id: google_id,
      title: title,
      authors: authors,
      thumbnail: thumbnail,
      status: status,
      notes: notes,
      added_date: added_date,
      rating: rating,
      progress: progress,
      description: description,
      publisher: publisher,
      published_date: published_date,
      page_count: page_count,
      isbn10: isbn10,
      isbn13: isbn13,
      language_codes: language_codes,
      categories: categories,
      formats: formats,
      preview_link: preview_link
    }
  end
end
