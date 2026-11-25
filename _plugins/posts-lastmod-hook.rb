#!/usr/bin/env ruby
#
# "Updated" date of a post, taken from its own front matter:
#
#   lastmod: 2026-09-01     -> the post shows "Updated Sep 1, 2026"
#
# It only counts when it is a later day than `date`. Asking git for the last commit of each post
# instead marks any commit as an update, a new cover image or a typo included, and makes the build
# depend on the repository history.

Jekyll::Hooks.register :site, :post_read do |site|
  site.posts.docs.each do |post|
    lastmod = post.data['lastmod']
    next if lastmod.nil?

    day = lastmod.respond_to?(:to_date) ? lastmod.to_date : Date.parse(lastmod.to_s)
    next unless day > post.date.to_date

    # a bare date becomes noon in the post's own UTC offset, so it stays on that day for every reader
    lastmod = Time.new(day.year, day.month, day.day, 12, 0, 0, post.date.utc_offset) unless lastmod.is_a?(Time)
    post.data['last_modified_at'] = lastmod
  end
end
