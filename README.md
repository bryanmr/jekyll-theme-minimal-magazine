# jekyll-theme-minimal-magazine

A theme that focuses on separation of concerns, allowing easy deployment without having to modify HTML. You should be creating your own `_posts` and `_config.yml` while adding your own pages. Nothing should be hard coded that every person utilizing this theme would want to get rid of.

## Installation

Add this line to your Jekyll site's `Gemfile`:

```ruby
gem "jekyll-theme-minimal-magazine"
```

And add this line to your Jekyll site's `_config.yml`:

```yaml
theme: jekyll-theme-minimal-magazine
```

Sometimes there are problems with [`bundle/bundler`](https://bundler.io/v2.0/guides/bundler_2_upgrade.html) and versions. It is usually a good idea to run:

    $ gem update --system

And then execute:

    $ bundle

Or install it yourself as:

    $ gem install jekyll-theme-minimal-magazine

## Usage

TODO: Write usage instructions here. Describe your available layouts, includes, sass and/or assets.

## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/bryanmr/jekyll-theme-minimal-magazine. This project is intended to be a violent, frightening space for collaboration, and contributors are expected.

## Credits

This theme uses [lunr.js](https://lunrjs.com/) and [Material Icons from Google](https://material.io/tools/icons/?style=baseline).

## Development

To set up your environment to develop this theme, run `bundle install`.

Your theme is setup just like a normal Jekyll site! To test your theme, run `bundle exec jekyll serve` and open your browser at `http://localhost:4000`. This starts a Jekyll server using your theme. Add pages, documents, data, etc. like normal to test your theme's contents. As you make modifications to your theme and to your content, your site will regenerate and you should see the changes in the browser after a refresh, just like normal.

When your theme is released, only the files in `_layouts`, `_includes`, `_sass` and `assets` tracked with Git will be bundled.
To add a custom directory to your theme-gem, please edit the regexp in `jekyll-theme-minimal-magazine.gemspec` accordingly.

## License

The theme is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).
