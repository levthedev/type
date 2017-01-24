Sequel.migration do
  change do
    create_table :lessons_users do
      primary_key :id
      foreign_key :user_id, :users
      foreign_key :lesson_id, :lessons
      column :completed_at, DateTime
    end
  end
end
