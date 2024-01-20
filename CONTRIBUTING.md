# Contributing to Splinter

Any contribution to Splinter is welcomed. Before committing something to VCS, run these command to make sure your
contribution is as per the styleguide

    make lint-fix
    make test

## Commit Messages

When you're adding commit messages, we'd love it if you could follow the 
[Angular Commit Message Format](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#commit).

Our CI/CD pipeline relies on commits in that specific format. This ensures it knows exactly when to roll
out a fresh version of the package and how to adjust the package version—whether it's a major, minor, or
patch/fix update. Moreover, maintaining a uniform commit message format makes it simpler for all users to
read and comprehend them.

You can read [the Angular doc] for full details,
but a quick, mostly copy-pasted summary is below. Also, that page is specific to the Angular GitHub repository, so
some of the rules are specific to the Angular repo. We will tweak things, when it makes sense (e.g. defining `scope`s,
relevant to our repo).

Feel free to check out the [Angular documentation](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#commit)
for a comprehensive guide. However, Keep in mind that this page is tailored to the Angular GitHub repository, so some
rules are Angular-specific. We'll make adjustments as needed, especially when defining scopes that are relevant to
our repository.

### Overall Structure

The structure of each commit should be like:

```
<header>
<BLANK LINE>
<optional body(ies)>
<BLANK LINE>
<optional footer(s)>
```

#### Header

The `header` looks like:

```
<type>(<scope>): <subject - a short summary>
  │       │             │
  │       │             └─⫸ Summary in present tense. Not capitalized. No period at the end.
  │       │
  │       └─⫸ Commit Scope: The module affected by the commit, e.g. cli, terraform, kubernetes, etc. Use `*` if the
  │                          commit affects multiple modules.
  │
  └─⫸ Commit Type: build|ci|docs|feat|fix|perf|refactor|test
```

##### type

Our CI/CD pipeline uses the `type` to determine how the package's SemVer number should be incremented/bumped.

Should be one of the following:

- **build:** Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)
- **ci:** Changes to our CI configuration files and scripts (examples: CircleCi, SauceLabs)
- **docs (or documentation):** Documentation only changes
- **feat (or feature):** A new feature
- **fix:** A bug fix
- **perf (or performance):** A code change that improves performance
- **refactor:** A code change that neither fixes a bug nor adds a feature
- **test:** Adding missing tests or correcting existing tests

The `type`-to-SemVer-bump mapping is:

- **Major version (e.g. x.0.0)**: Any `type` value if an exclamation mark is included before the colon (e.g. `feat!`
  or `docs(cli)!`)
  OR if the commit contains a `BREAKING CHANGE:` footer.
- **Minor version (e.g. 1.x.0)**: `feat`
- **Fix/Patch version (e.g. 1.2.x)**: `fix` or `perf`

All other `type` values do not bump the version, and therefore will not trigger a release.

(Refer to the `python-semantic-release` library's 
[Angular parser](https://github.com/python-semantic-release/python-semantic-release/blob/master/semantic_release/history/parser_angular.py)
to verify those mappings)

#### scope

The scope should be the name of a functionality of the package.

Some examples are, but not limited to:

* ui
* api

### Body

A longer explanation of your commit, if the `subject` in the `header` (the short summary) does not fully describe your
commit. The `body` can be multiple paragraphs, but make sure no paragraph starts with a word followed by a colon
(e.g. `foo:`, `foo-bar:`, etc.). That format is used to denote a `footer` section.

### Footer(s)

The footer should contain any information about Breaking Changes and is also the place to reference GitHub issues that
this commit relates to or closes.

### Example

```
fix(cli): A brief description of the commit

A longer description, to add background and/or more details.

You can have multiple paragraphs. Just don't start a paragraph with a single word and a colon (e.g. `foo:`). That
format is reserved for the `<type>(optional scope) <description>` and footers

closes: https://github.com/dsquare-io/some-repo/issues/1234
related-to: https://github.com/dsquare-io/some-repo/issues/5678
```

Looking at the format and the example, a description of each section is:

- Header (mandatory): `<type>(optional scope) <description>`
    + `type`: This is a `fix` commit. Since `fix(cli):` does not end with an exclamation mark, nor do we have a
      `BREAKING CHANGE:` footer, this will bump the version number as a fix/patch (e.g. `1.2.3` to `1.2.4`)
    + `scope`: The scope is `cli`, implying the commit had changes affecting the CLI functionality of the package
    + `subject`: `A brief description of the commit`
- Body (optional): The two paragraphs starting with `A longer description, [...]` and `You can have [...]`
- Footers (optional): The `closes:` and `related-to:` sections.

### Additional Links

There is a [Conventional Commits specification](https://www.conventionalcommits.org/en) based off the Angular Commit
Message Format, but generalized beyond Angular.
