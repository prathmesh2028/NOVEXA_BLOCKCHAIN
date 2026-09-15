import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

/**
 * SHA-256 Merkle Tree implementation.
 * Supports: leaf, pair, parent, root, proof, verification.
 */
@Injectable()
export class MerkleService {
  private hash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  private hashPair(left: string, right: string): string {
    // Sort to ensure deterministic ordering
    const [a, b] = left < right ? [left, right] : [right, left];
    return this.hash(a + b);
  }

  /**
   * Build a Merkle tree from leaf hashes.
   * Returns all levels of the tree, with the root at the top.
   */
  buildTree(leaves: string[]): { root: string; levels: string[][] } {
    if (leaves.length === 0) {
      return { root: this.hash(''), levels: [[this.hash('')]] };
    }

    if (leaves.length === 1) {
      return { root: leaves[0], levels: [leaves] };
    }

    const levels: string[][] = [leaves];
    let currentLevel = [...leaves];

    while (currentLevel.length > 1) {
      const nextLevel: string[] = [];
      for (let i = 0; i < currentLevel.length; i += 2) {
        if (i + 1 < currentLevel.length) {
          nextLevel.push(this.hashPair(currentLevel[i], currentLevel[i + 1]));
        } else {
          // Odd number: duplicate last
          nextLevel.push(this.hashPair(currentLevel[i], currentLevel[i]));
        }
      }
      levels.push(nextLevel);
      currentLevel = nextLevel;
    }

    return { root: currentLevel[0], levels };
  }

  /**
   * Generate a Merkle proof for a leaf at given index.
   */
  generateProof(leaves: string[], index: number): { proof: string[]; root: string } {
    const { levels, root } = this.buildTree(leaves);
    const proof: string[] = [];
    let idx = index;

    for (let level = 0; level < levels.length - 1; level++) {
      const currentLevel = levels[level];
      const siblingIdx = idx % 2 === 0 ? idx + 1 : idx - 1;
      
      if (siblingIdx < currentLevel.length) {
        proof.push(currentLevel[siblingIdx]);
      } else {
        proof.push(currentLevel[idx]); // duplicate for odd
      }
      
      idx = Math.floor(idx / 2);
    }

    return { proof, root };
  }

  /**
   * Verify a Merkle proof.
   */
  verifyProof(leaf: string, proof: string[], root: string): boolean {
    let current = leaf;
    for (const sibling of proof) {
      current = this.hashPair(current, sibling);
    }
    return current === root;
  }

  /**
   * Compute the root hash from leaves.
   */
  computeRoot(leaves: string[]): string {
    return this.buildTree(leaves).root;
  }
}
