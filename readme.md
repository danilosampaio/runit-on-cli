# runit-on-cli
> Test node modules directly on CLI

[![CircleCI](https://circleci.com/gh/danilosampaio/runit-on-cli.svg?style=svg)](https://circleci.com/gh/danilosampaio/runit-on-cli)

## Install

```
npm install -g runit-on-cli
```

## Run

```
$ runit-on-cli greedy-wrap -p \'Supercalifragilisticexpialidocious\'

=== Result ===
Supercalifragilisticexpialidocious
```

__Named Export__

```
$ runit-on-cli axios get -p \'http://universities.hipolabs.com\'

=== Result ===
{
    ...
    data: {
        author: { name: 'hipo', website: 'http://hipolabs.com' },
        github: 'https://github.com/Hipo/university-domains-list',
        example: 'http://universities.hipolabs.com/search?name=middle&country=Turkey'
    }
}
```

```
$ runit-on-cli lodash orderBy -p '[{name:"banana"},{name:"apple"}]' '["name"]'

=== Result ===
[ { name: 'apple' }, { name: 'banana' } ]
```

```
$ runit-on-cli lodash orderBy -p "$(cat ./users.json)" '["name"]'

=== Result ===
[ { name: 'ane' }, { name: 'john' }, { name: 'mary' } ]
```

```
$ runit-on-cli lodash map -p "$(cat ./users.json)" 'e => {e.full = e.first + " " + e.last; return e;}'

=== Result ===
[
  { first: 'mary', last: 'jane', full: 'mary jane' },
  { first: 'john', last: 'mayer', full: 'john mayer' },
  { first: 'ane', last: 'mcfly', full: 'ane mcfly' }
]
```

```
$ runit-on-cli -s chalk -f blue -p \"Hello World\"

=== Result ===
Hello World
```

```
$ runit-on-cli uuid v4

=== Result ===
cfd9803e-3a4a-44ec-95b7-c2e40dbbbc57
```

### API

```
runit-on-cli <module-name> <named-export> [-n] [version] [-s] [-e] [-f] [functionName] [-p] [list of params]
```

## License

MIT © [Danilo Sampaio](http://github.org/danilosampaio)