import { describe, it, expect, beforeEach } from 'vitest';
import { MerkleService } from './merkle.service';

describe('MerkleService', () => {
  let merkleService: MerkleService;

  beforeEach(() => {
    merkleService = new MerkleService();
  });

  it('should handle empty leaf array', () => {
    const result = merkleService.buildTree([]);
    expect(result.root).toBeDefined();
    expect(result.levels.length).toBe(1);
  });

  it('should handle single leaf', () => {
    const leaf = 'a'.repeat(64);
    const result = merkleService.buildTree([leaf]);
    expect(result.root).toBe(leaf);
    expect(result.levels[0]).toEqual([leaf]);
  });

  it('should compute deterministic root for pairs of leaves', () => {
    const leaf1 = '1111111111111111111111111111111111111111111111111111111111111111';
    const leaf2 = '2222222222222222222222222222222222222222222222222222222222222222';
    
    const root1 = merkleService.computeRoot([leaf1, leaf2]);
    const root2 = merkleService.computeRoot([leaf2, leaf1]);
    
    // Sort pair ensures determinism regardless of input order
    expect(root1).toEqual(root2);
  });

  it('should build a tree and generate valid proofs for all leaves', () => {
    const leaves = [
      'leaf_hash_0',
      'leaf_hash_1',
      'leaf_hash_2',
      'leaf_hash_3',
    ];

    const tree = merkleService.buildTree(leaves);
    expect(tree.root).toBeDefined();

    leaves.forEach((leaf, idx) => {
      const { proof, root } = merkleService.generateProof(leaves, idx);
      expect(root).toBe(tree.root);
      const isValid = merkleService.verifyProof(leaf, proof, root);
      expect(isValid).toBe(true);
    });
  });

  it('should fail verification if proof or leaf is tampered with', () => {
    const leaves = ['leaf_a', 'leaf_b', 'leaf_c', 'leaf_d', 'leaf_e'];
    const { proof, root } = merkleService.generateProof(leaves, 2);

    // Tampered leaf
    expect(merkleService.verifyProof('leaf_tampered', proof, root)).toBe(false);

    // Tampered root
    expect(merkleService.verifyProof('leaf_c', proof, 'fake_root')).toBe(false);
  });
});
