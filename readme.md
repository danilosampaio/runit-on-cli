# runit-on-cli
> Run node modules directly on CLI

[![CircleCI](https://circleci.com/gh/danilosampaio/runit-on-cli.svg?style=svg)](https://circleci.com/gh/danilosampaio/runit-on-cli)

## Install

```
npm install -g runit-on-cli
```

### API

```
$ runit-on-cli <module-name> <named-export> [-c] [-f [functionName]] [-n [version]] [-p [parameters...]] [-s] [-t [transformFunction]] [-u [subModule]]
```

- `-c, --call-module-as-function`: call the exported module as a function intead of object
- `-f, --function-name [functionName]`: call a specific function from exported module
- `-n, --npm-module-version [version]`: run a specific version of the npm module
- `-p, --params [parameters...]`: list of params that will be passed to the module/function call
- `-s, --silent`: print only the module output, without progress or logs
- `-t, --transform-output [transformFunction]`: define a function to modify module/function return
- `-u, --sub-module [subModule]`: import a submodule, such as 'crypto-js/sha256'

## Examples

__Running a module with default export, passing one string parameter:__

```sh
$ runit-on-cli jwt-decode -p \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c\"
```

![Image](assets/example1.png)

*The above example using silent mode (-s option) will output only the return content:*

```js
{ sub: '1234567890', name: 'John Doe', iat: 1516239022 }
```

__Running a module with a named export, passing two parameters, an object and an array:__

```sh
$ runit-on-cli -s lodash orderBy -p '[{name:"banana"},{name:"apple"}]' '["name"]'
```
```js
[ { name: 'apple' }, { name: 'banana' } ]
```

__Passing a parameter from a file content:__

```sh
$ runit-on-cli -s lodash orderBy -p "$(cat ./users.json)" '["first"]'
```
```js
[
  { first: 'ane', last: 'mcfly' },
  { first: 'john', last: 'mayer' },
  { first: 'mary', last: 'jane' }
]
```

__A more complex example using lodash map:__

```sh
$ runit-on-cli -s lodash map -p "$(cat ./users.json)" 'e => {e.full = e.first + " " + e.last; return e;}'
```
```js
[
  { first: 'mary', last: 'jane', full: 'mary jane' },
  { first: 'john', last: 'mayer', full: 'john mayer' },
  { first: 'ane', last: 'mcfly', full: 'ane mcfly' }
]
```

__Running async functions and transform the output to return a specific property:__

```sh
$ runit-on-cli -s axios get -p \'http://universities.hipolabs.com\' -t 'output.data'
```
```js
{
    data: {
        author: { name: 'hipo', website: 'http://hipolabs.com' },
        github: 'https://github.com/Hipo/university-domains-list',
        example: 'http://universities.hipolabs.com/search?name=middle&country=Turkey'
    }
}
```

__A more complex example of using -t option:__

```sh
$ runit-on-cli -s moment -t 'moment().add(7, "days").format("YYYY/MM/DD")'
```
```
2021/08/01
```
*Using the `-t` option is possible to use the node environment, actually.*


__Using the node environment by -t option:__

```sh
$ runit-on-cli -s axios get -p \'http://universities.hipolabs.com\' -t 'Object.keys(output.data)'
```
```js
[ 'author', 'github', 'example' ]
```


__Call a specific function from exported module:__

```sh
$ runit-on-cli chalk -f blue -p \"Hello World\"
```

![Image](assets/example2.png)

*The same result is got by using `-t` option: `runit-on-cli chalk -p \"Hello World\" -t 'chalk.blue(output)'`*


__Another example of calling a specific function from exported module:__

```sh
$ runit-on-cli -s faker -f phone.phoneNumber
```
```
550-681-2495
```

__Running a module with a named export, without parameters:__

```sh
$ runit-on-cli -s uuid v4
```
```sh
2a7bb8f8-ac20-46ea-a0eb-ea58df26d48e
```

__Running the exported module as a function intead of object, and call a specific function:__

```sh
$ runit-on-cli moment -c -f add -p 7 \'days\'
```

![Image](assets/example3.png)

*The `-c` options is necessary for this case because `moment` export is a function: `moment().add(7,'days')`*

__Running a submodule:__

```sh
$ runit-on-cli crypto-js -u sha256 -p \'test\'
```

![Image](assets/example4.png)


## License

MIT © [Danilo Sampaio](http://github.org/danilosampaio)