require 'gmail'
require 'letsencrypt-rails-heroku'

Letsencrypt.configure
spec = Gem::Specification.find_by_name 'letsencrypt-rails-heroku'
load "#{spec.gem_dir}/lib/tasks/letsencrypt.rake"

task :email do
  gmail = Gmail.connect!(ENV['PARALELA_USERNAME'], ENV['GMAIL_PASSWORD'])
  # gmail = Gmail.connect!(:xoauth2, ENV['PARALELA_USERNAME'], ENV['PARALELA_ACCESS_TOKEN'])
  User.map do |user|
    completed_lessons = lessons_users = LessonsUsers.where(user_id: user.id).to_a
    today = DateTime.now
    todays_lessons = completed_lessons.select do |lesson|
      lesson.completed_at.to_datetime + 1.0 > today
    end

    all_vocab = {}
    todays_lessons.map do |lesson_user|
      all_vocab.merge!(Lesson[lesson_user.lesson_id].vocab)
    end
    vocab_html = ''
    all_vocab.map do |vocab, translation|
      vocab_html += "<li>#{vocab}: #{translation}</li>\n\n"
    end

    yesterday = today - 1.0
    if all_vocab.keys.length > 0
      gmail.deliver do
        to user.email
        from 'lev@parale.la'
        subject "French vocab from #{yesterday.month}/#{yesterday.day}"
        html_part do
          content_type 'text/html; charset=UTF-8'
          body "<h4>Daily Vocab</h4><br>Hey #{user.first_name}! Lev here, with your daily vocab from the lessons you completed yesterday at https://parale.la.<br><br><ul>#{vocab_html}</ul><br> Be sure to reply to this email to let me know if you have any thoughts about Paralela, would like to unsubscribe, or are just enjoying the website!<br>Cheers,<br><br>Lev"
        end
      end
    end
  end
  gmail.logout
end

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
    args.with_defaults(:target => 3)

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
