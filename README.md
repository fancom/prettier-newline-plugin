# prettier-new-line-plugin

A Prettier plugin that automatically adds a newline after function declarations if one doesn't already exist.

## Installation

```bash
npm install --save-dev prettier-new-line-plugin
```

or

```bash
yarn add --dev prettier-new-line-plugin
```

## Usage

The plugin will automatically be discovered by Prettier as long as it's installed in your project. No additional configuration is required.

### Before

```javascript
function firstFunction() {
  return 'hello';
}
function secondFunction() {
  return 'world';
}

const arrowFunction = () => {
  return 'arrow';
};
const anotherFunction = () => 'another';

class MyClass {
  method1() {
    return 'method1';
  }
  method2() {
    return 'method2';
  }
}
```

### After

```javascript
function firstFunction() {
  return 'hello';
}

function secondFunction() {
  return 'world';
}

const arrowFunction = () => {
  return 'arrow';
};

const anotherFunction = () => 'another';

class MyClass {
  method1() {
    return 'method1';
  }

  method2() {
    return 'method2';
  }
}
```

## Configuration

You can disable this plugin by adding the following to your Prettier configuration:

```json
{
  "addNewlineAfterFunction": false
}
```

## Supported Function Types

This plugin adds newlines after:
- Function declarations (`function myFunc() {}`)
- Function expressions (`const myFunc = function() {}`)
- Arrow functions (`const myFunc = () => {}`)
- Class methods
- Variable declarations with function assignments

## How it works

The plugin:
1. Parses your code using Prettier's TypeScript parser
2. Identifies function-like nodes in the AST
3. Checks if there's already a newline after each function
4. Adds a newline if one doesn't exist and the function is not the last item in its container

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.