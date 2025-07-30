require 'securerandom'

class LibraryEntry
  attr_accessor :id, :title, :author, :status, :notes

  def initialize(id: nil, title:, author:, status: 'unread', notes: "")
    @id = id || SecureRandom.uuid
    @title = title
    @author = author
    @status = status
    @notes = notes
  end

  def to_h
    {
      id: id,
      title: title,
      author: author,
      status: status,
      notes: notes
    }
  end
end
