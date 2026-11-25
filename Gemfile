# frozen_string_literal: true

source "https://rubygems.org"

# 7.6.x on purpose: assets/css/jekyll-theme-chirpy.scss and _layouts/home.html extend
# that version of the theme. Review both before moving to a newer one.
gem "jekyll-theme-chirpy", "~> 7.6.0"

gem "html-proofer", "~> 5.0", group: :test

platforms :mingw, :x64_mingw, :mswin, :jruby do
  gem "tzinfo", ">= 1", "< 3"
  gem "tzinfo-data"
end

gem "wdm", "~> 0.2.0", :platforms => [:mingw, :x64_mingw, :mswin]
