class Lesson < Sequel::Model
  many_to_many :users
end

class User < Sequel::Model
  many_to_many :lessons
  one_to_many :custom_lessons, class: :CustomLesson
end

class LessonsUsers < Sequel::Model
end

class CustomLesson < Sequel::Model
end
