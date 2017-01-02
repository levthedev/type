Sequel.migration do
  change do
    create_table :users do
      primary_key :id
      column :email, String, size: 255, null: false, unique: true
      column :first_name, String, size: 255, null: true
      column :subscription, String, size: 255, null: true
      column :plan, String, size: 255, null: true
      column :plan_amount, Fixnum, size: 255, null: true
      column :subscribed, FalseClass, null: false
    end
  end
end
