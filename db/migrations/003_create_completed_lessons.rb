Sequel.migration do
  change do
    create_table :lessons_users do
      foreign_key :user_id, :users
      foreign_key :lesson_id, :lessons
    end
  end
end

# Sequel.migration do
#   down do
#     drop_table :completed_lessons do
#       foreign_key :user_id, :users, :cascade=>:cascade
#       foreign_key :lesson_id, :lessons, :cascade=>:cascade
#     end
#   end
# end

# Sequel.migration do
#   down do
#     drop_table(:lessons)
#   end
# end
