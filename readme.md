# runit-on-cli
> Test node modules directly on CLI

## install

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
$ runit-on-cli uuid v4

=== Result ===
cfd9803e-3a4a-44ec-95b7-c2e40dbbbc57
```

### API

```
runit-on-cli <module-name> <named-export> [-p] [list of params]
```

## License

MIT © [Danilo Sampaio](http://github.org/danilosampaio)