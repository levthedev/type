Sequel.migration do
  change do
    create_table :lessons do
      primary_key :id
      column :text, String, size: 255, null: false
      column :language, String, size: 255
      column :translation, :jsonb
      column :category, String, size: 255, null: false
      column :vocab, :jsonb
    end
  end
end
