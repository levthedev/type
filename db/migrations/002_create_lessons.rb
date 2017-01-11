Sequel.migration do
  change do
    create_table :lessons do
      primary_key :id
      column :text, String, size: 255, null: false, unique: true
      column :language, String, size: 255
      column :translation, :jsonb
    end
  end
end
