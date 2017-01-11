class Lesson < Sequel::Model
  many_to_many :users
end

class User < Sequel::Model
  many_to_many :lessons
end
