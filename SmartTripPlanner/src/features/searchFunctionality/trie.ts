// TrieNode Class
class TrieNode {
    children: { [key: string]: TrieNode };
    isEndOfWord: boolean;

    constructor() {
      this.children = {};
      this.isEndOfWord = false;
    }
  }

  // Trie Class
  class Trie {
    root: TrieNode;

    constructor() {
      this.root = new TrieNode();
    }

    // Insert a word into the Trie
    insert(word: string) {
      let node = this.root;
      for (const char of word.toLowerCase()) {
        if (!node.children[char]) {
          node.children[char] = new TrieNode();
        }
        node = node.children[char];
      }
      node.isEndOfWord = true;
    }

    // Search for suggestions based on prefix
    searchPrefix(prefix: string): string[] {
      let node = this.root;
      for (const char of prefix.toLowerCase()) {
        if (!node.children[char]) {
          return [];
        }
        node = node.children[char];
      }
      return this.getWordsFromNode(node, prefix);
    }

    // Get all words from a given node
    private getWordsFromNode(node: TrieNode, prefix: string): string[] {
      let words: string[] = [];

      if (node.isEndOfWord) words.push(prefix);

      for (const char in node.children) {
        words = words.concat(this.getWordsFromNode(node.children[char], prefix + char));
      }

      return words;
    }
  }

  // Initialize Trie and Insert Big Places
  const bigPlaces = [
    "Dubai", "Singapore", "New York", "Tokyo","tomiyo","tosiyo","tokyoyo", "London", "Paris",
    "Hong Kong", "Los Angeles", "Sydney", "Bangkok", "Seoul",
    "San Francisco", "Chicago", "Berlin", "Shanghai", "Barcelona"
  ];

  const trie = new Trie();
  bigPlaces.forEach(place => trie.insert(place));

  export default trie;
