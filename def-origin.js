var defnode = require('defnode'), tern = require('tern');

tern.registerPlugin('def-origin', function(server, options) {
  function traverse(av) {
    // detect cycles
    if (av._defNodeSeen) return;
    av._defNodeSeen = true;

    var type = av.getType();
    if (type && av.originNode && av.originNode.sourceFile) {
      if (!type.metaData) type.metaData = {};
      type.metaData.aval = avalMetaData(av);
      type.metaData.type = typeMetaData(type);
    }

    av.forAllProps(function(prop, val, local) {
        traverse(val);
    });
  }

  return {
    passes: {
      preCondenseReach: function(state) {
        Object.keys(state.roots).forEach(function(rootName) {
          traverse(state.roots[rootName]);
        });
        Object.keys(state.cx.topScope.props).forEach(function(prop) {
          traverse(state.cx.topScope.props[prop]);
        });
      },
    },
  };
});

function avalMetaData(av) {
  var md = {
    originFile: av.originNode.sourceFile.name,
    identSpan: formatSpan(av.originNode),
  };
  try {
    var defNode = defnode.findDefinitionNode(av.originNode.sourceFile.ast, av.originNode.start, av.originNode.end)
    if (defNode) {
      md['defSpan'] = formatSpan(defNode);
    }
  } catch (e) {}
  return md;
}

function typeMetaData(t) {
  var md = {};
  if (t.origin) md.origin = t.origin;
  if (t.name) md.name = t.name;
  return md;
}

function formatSpan(node) {
  return node.start + '-' + node.end;
}
