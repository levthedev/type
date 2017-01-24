require 'gmail'
require 'letsencrypt-rails-heroku'

Letsencrypt.configure
spec = Gem::Specification.find_by_name 'letsencrypt-rails-heroku'
load "#{spec.gem_dir}/lib/tasks/letsencrypt.rake"

task :email do
  User.map do |user|
    completed_lessons = lessons_users = LessonsUsers.where(user_id: user.id).to_a
    today = DateTime.now
    todays_lessons = completed_lessons.select do |lesson|
      lesson.completed_at.to_datetime + 1.0 > today
    end

    vocab = []
    todays_lessons.map do |lesson_user|
      vocab += Lesson.where(id: lesson_user.lesson_id).first.vocab
    end
    # TODO add translation for vocab word
    vocab_html = ''
    vocab.map { |word| vocab_html += "<li>#{word}</li>\n\n" }
    puts vocab_html
    # TODO actually send email
    # send_email(to: user.email, from: 'lev@parale.la', html: "<h4>Daily Vocab</h4><br>Hey there! Lev here, with your vocab from the lessons you completed yesterday at https://parale.la. Be sure to reply to this email to let me know if yourre having any problems or are enjoying Paralela!<br><br><br><ul>#{vocab_html}</ul><br><br>Cheers,<br><br>Lev")
  end
end

namespace :db do
  require "sequel"

  Sequel.extension :migration
  DB = Sequel.connect(ENV['DATABASE_URL'])
  DB.extension :pg_json
  DB.extension :pg_array
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
