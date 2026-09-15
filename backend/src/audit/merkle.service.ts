import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class MerkleService {
  private readonly logger = new Logger(MerkleService.name);

  /**
   * Hash a single leaf node (e.g., an audit event hash)
   */
  hashLeaf(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Hash a pair of nodes to create a parent node in the Merkle tree
   */
  hashPair(left: string, right: string): string {
    // Sort to ensure consistency regardless of order
    const [a, b] = [left, right].sort();
    return crypto.createHash('sha256').update(a + b).digest('hex');
  }

  /**
   * Compute the Merkle root from a list of leaf hashes
   */
  computeRoot(leaves: string[]): string {
    if (!leaves || leaves.length === 0) {
      return '';
    }

    if (leaves.length === 1) {
      return leaves[0];
    }

    const nextLevel: string[] = [];
    for (let i = 0; i < leaves.length; i += 2) {
      if (i + 1 < leaves.length) {
        nextLevel.push(this.hashPair(leaves[i], leaves[i + 1]));
      } else {
        // If odd number of leaves, duplicate the last one
        nextLevel.push(this.hashPair(leaves[i], leaves[i]));
      }
    }

    return this.computeRoot(nextLevel);
  }
}
