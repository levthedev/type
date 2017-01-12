Sequel.migration do
  change do
    create_table :lessons_users do
      foreign_key :user_id, :users
      foreign_key :lesson_id, :lessons
    end
  end
end
