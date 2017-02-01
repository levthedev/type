Sequel.migration do
  change do
    create_table :custom_lessons do
      primary_key :id
      foreign_key :user_id, :users
      foreign_key :lesson_id, :lessons
    end
  end
end
