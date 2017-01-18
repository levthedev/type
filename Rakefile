require 'letsencrypt-rails-heroku'
Letsencrypt.configure
spec = Gem::Specification.find_by_name 'letsencrypt-rails-heroku'
load "#{spec.gem_dir}/lib/tasks/letsencrypt.rake"

namespace :db do
  require "sequel"

  Sequel.extension :migration
  DB = Sequel.connect(ENV['DATABASE_URL'])
  DB.extension :pg_json
  require "./util/models"

  desc "Prints current schema version"
  task :version do
    version = if DB.tables.include?(:schema_info)
      DB[:schema_info].first[:version]
    end || 0

    puts "Schema Version: #{version}"
  end

  desc "Perform migration up to latest migration available"
  task :migrate do
    Sequel::Migrator.run(DB, "db/migrations")
    Rake::Task['db:version'].execute
  end

  desc "Perform rollback to specified target or full rollback as default"
  task :rollback, :target do |t, args|
    args.with_defaults(:target => 0)

    Sequel::Migrator.run(DB, "db/migrations", :target => args[:target].to_i)
    Rake::Task['db:version'].execute
  end

  desc "Perform migration reset (full rollback and migration)"
  task :reset do
    Sequel::Migrator.run(DB, "db/migrations", :target => 0)
    Sequel::Migrator.run(DB, "db/migrations")
    Rake::Task['db:version'].execute
  end
end
