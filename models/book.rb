require 'securerandom'

class Book
  # I don't know what attr_accessor is yet... 🤔
  attr_accessor :id, :title, :author, :status

  def initialize(title:, author:, status: 'to-read', id: nil)
    @id = id || SecureRandom.uuid
    @title = title
    @author = author
    @status = status
  end

  def to_h
    {
      id: id,
      title: title,
      author: author,
      status: status
    }
  end
end
