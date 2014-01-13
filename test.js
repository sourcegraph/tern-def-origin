var assert = require('assert'), execFile = require('child_process').execFile, path = require('path');

describe('tern condense output', function() {
  [
    {name: 'simple'},
    {name: 'nodejs', args: ['--plugin', 'node']},
  ].forEach(function(file) {
    it(file.name + ' (with args: ' + (file.args || []).join(' ') + ')', function(done) {
      var want = require('./testdata/' + file.name + '.json');
      var args = ['node_modules/tern/bin/condense'];
      if (file.args) args.push.apply(args, file.args);
      args.push('--plugin', 'def-origin', 'testdata/' + file.name + '.js')
      execFile(process.execPath /* node */, args, function(err, stdout, stderr) {
        if (stderr) console.error(stderr);
        assert.ifError(err);
        var got = JSON.parse(stdout);
        // console.log(JSON.stringify(got, null, 2));
        assert.deepEqual(got, want);
        done();
      });
    });
  });
});
