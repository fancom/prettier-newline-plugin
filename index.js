const { parsers } = require('prettier/parser-typescript');

// Function to check if there's already a newline after a node
function hasNewlineAfter(text, node, locEnd) {
  const end = locEnd(node);
  const afterNode = text.slice(end);
  
  // Check if there are already two or more consecutive newlines
  const match = afterNode.match(/^(\s*\n\s*\n)/);
  return match !== null;
}

// Function to add newline after function if needed
function addNewlineAfterFunction(text, node, locEnd) {
  if (hasNewlineAfter(text, node, locEnd)) {
    return text;
  }
  
  const end = locEnd(node);
  const beforeNode = text.slice(0, end);
  const afterNode = text.slice(end);
  
  // Find the next non-whitespace content
  const nextContentMatch = afterNode.match(/^(\s*)([\s\S]*)/);
  if (!nextContentMatch) {
    return text;
  }
  
  const [, whitespace, rest] = nextContentMatch;
  
  // If there's already a single newline, add another one
  if (whitespace.includes('\n')) {
    const newWhitespace = whitespace.replace(/\n/, '\n\n');
    return beforeNode + newWhitespace + rest;
  } else {
    // Add double newline if no newline exists
    return beforeNode + '\n\n' + whitespace + rest;
  }
}

// Transform function to process the AST
function transform(ast, text, options) {
  const { locStart, locEnd } = options;
  
  // Traverse the AST and collect function nodes that need newlines
  const functionsToProcess = [];
  
  function visit(node, parent, key, index) {
    if (!node || typeof node !== 'object') {
      return;
    }
    
    // Check if this is a function-like node
    const isFunctionLike = 
      node.type === 'FunctionDeclaration' ||
      node.type === 'FunctionExpression' ||
      node.type === 'ArrowFunctionExpression' ||
      node.type === 'MethodDefinition' ||
      (node.type === 'VariableDeclaration' && 
       node.declarations && 
       node.declarations.some(decl => 
         decl.init && 
         (decl.init.type === 'FunctionExpression' || 
          decl.init.type === 'ArrowFunctionExpression')
       ));
    
    if (isFunctionLike && parent && Array.isArray(parent[key])) {
      // Only add newline if this function is not the last item in its container
      const isLastInContainer = index === parent[key].length - 1;
      if (!isLastInContainer) {
        functionsToProcess.push(node);
      }
    }
    
    // Recursively visit child nodes
    Object.keys(node).forEach(childKey => {
      const child = node[childKey];
      if (Array.isArray(child)) {
        child.forEach((grandchild, i) => visit(grandchild, node, childKey, i));
      } else if (child && typeof child === 'object' && child.type) {
        visit(child, node, childKey, null);
      }
    });
  }
  
  visit(ast, null, null, null);
  
  // Sort functions by their position in the file (end position, descending)
  // This ensures we process from bottom to top to avoid position shifts
  functionsToProcess.sort((a, b) => locEnd(b) - locEnd(a));
  
  // Apply transformations
  let transformedText = text;
  functionsToProcess.forEach(node => {
    transformedText = addNewlineAfterFunction(transformedText, node, locEnd);
  });
  
  return transformedText;
}

// Create custom parsers
const customParsers = {};

Object.keys(parsers).forEach(parserName => {
  customParsers[parserName] = {
    ...parsers[parserName],
    preprocess: (text, options) => {
      // First run the original preprocessor if it exists
      const originalText = parsers[parserName].preprocess 
        ? parsers[parserName].preprocess(text, options)
        : text;
      
      // Parse the code to get AST
      const ast = parsers[parserName].parse(originalText, options);
      
      // Transform the text based on AST
      return transform(ast, originalText, {
        locStart: parsers[parserName].locStart,
        locEnd: parsers[parserName].locEnd
      });
    }
  };
});

module.exports = {
  parsers: customParsers,
  options: {
    addNewlineAfterFunction: {
      type: 'boolean',
      category: 'Global',
      default: true,
      description: 'Add newline after function declarations if not present'
    }
  }
};