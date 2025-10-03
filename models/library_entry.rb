# models/library_entry.rb
require 'securerandom'

class LibraryEntry
  attr_accessor :id, :google_id, :title, :authors, :thumbnail, :status, :notes, :added_date

  def initialize(id: nil, google_id: nil, title:, authors:, thumbnail: nil, status: 'unread', notes: "", added_date: nil)
    @id = id
    @google_id = google_id
    @title = title
    @authors = authors
    @thumbnail = thumbnail
    @status = status
    @notes = notes
    @added_date = added_date
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
      added_date: added_date
    }
  end
end
