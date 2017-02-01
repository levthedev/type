Sequel.migration do
  change do
    alter_table :users do
      add_column :premium, FalseClass, null: false, default: false
    end
  end
end
