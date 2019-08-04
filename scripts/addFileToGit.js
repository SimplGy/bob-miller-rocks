// TODO: put this in an npm repo so I can depend on it cleanly in cloud functions

const Octokit = require('@octokit/rest'); // https://octokit.github.io/rest.js/

// Auth
const { auth } = require('./_secrets');

// User-specific config
const owner = 'simplgy';
const repo = 'bob-miller-rocks';
const ref = 'heads/master';

// github config
const userAgent = 'addFileToGit.js v0.1'; // ?
const FILE = '100644'; // commit mode
const octokit = new Octokit({ auth, userAgent });
const message = 'simplgy/addFileToGit.js scripted commit';
const encoding = 'utf-8';



/**
 * Create a single-file commit on top of head.
 * Send it a file path like "foo.txt" and a string of file contents.
 */
async function addFileToGit(path, content) {

  // 1. Get the sha of the last commit
  const { data: { object } } = await octokit.git.getRef({repo, owner, ref}); //github.ref(repo, ref).object.sha
  const sha_latest_commit = object.sha; // latest commit

  // 2. Find and store the SHA for the tree object that the heads/master commit points to.
  // sha_base_tree = github.commit(repo, sha_latest_commit).commit.tree.sha
  const { data: { tree }} = await octokit.git.getCommit({repo, owner, commit_sha: sha_latest_commit})
  const sha_base_tree = tree.sha; // root of tree for commit

  // 3. Make some content
  const { data: { sha: blob_sha } } = await octokit.git.createBlob({
    repo, owner, encoding, content,
  });

  // 4. Create a new tree with the content in place
  const { data: new_tree } = await octokit.git.createTree({
    repo, owner,
    base_tree: sha_base_tree, // if we don't set this, all other files will show up as deleted.
    tree: [
      {
        path,
        mode: FILE,
        type: 'blob',
        sha: blob_sha,
      }
    ],
  });

  // 5. Create a new commit with this tree object
  const { data: new_commit } = await octokit.git.createCommit({
    repo, owner,
    message,
    tree: new_tree.sha,
    parents: [
      sha_latest_commit
    ],
  });

  // 6. Move the reference heads/master to point to our new commit object.
  const { data: { object: updated_ref } } = await octokit.git.updateRef({
    repo, owner, ref,
    sha: new_commit.sha, 
  });

  console.log({sha_latest_commit, updated_ref: updated_ref.sha});
}

exports.addFileToGit = addFileToGit;