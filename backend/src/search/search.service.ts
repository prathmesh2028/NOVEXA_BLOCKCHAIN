import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(query: string) {
    const start = Date.now();
    const results: any[] = [];

    if (!query || query.length < 2) {
      return { results: [], query, total: 0, time_ms: 0 };
    }

    try {
      // Search assets
      const assets = await this.prisma.asset.findMany({
        where: {
          OR: [
            { assetId: { contains: query, mode: 'insensitive' } },
            { serialNumber: { contains: query, mode: 'insensitive' } },
            { type: { contains: query, mode: 'insensitive' } },
            { model: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 5,
      });

      for (const a of assets) {
        results.push({
          id: a.id, type: 'asset', title: `${a.assetId} — ${a.type}`,
          subtitle: `${a.model} • ${a.serialNumber}`,
          url: `/app/assets/${a.assetId}`,
          status: a.lifecycleState, badge: a.certStatus,
          relevance: 1.0,
        });
      }

      // Search users
      const users = await this.prisma.user.findMany({
        where: { OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ] },
        take: 5, include: { actor: true },
      });

      for (const u of users) {
        results.push({
          id: u.id, type: 'user', title: u.name, subtitle: u.email,
          url: `/app/users`, status: u.status,
          relevance: 0.9,
        });
      }

      // Search certifications
      const certs = await this.prisma.certification.findMany({
        where: { OR: [
          { certId: { contains: query, mode: 'insensitive' } },
          { txHash: { contains: query, mode: 'insensitive' } },
        ] },
        take: 5,
      });

      for (const c of certs) {
        results.push({
          id: c.id, type: 'certification', title: c.certId,
          subtitle: c.txHash || 'Pending', url: `/app/certifications/${c.certId}`,
          status: c.status, relevance: 0.8,
        });
      }
    } catch (e: any) {
      const q = query.toLowerCase();
      const { FALLBACK_ASSETS, FALLBACK_USERS, FALLBACK_CERTIFICATIONS, FALLBACK_TRANSACTIONS } = await import('../common/fallback-data');

      const matchedAssets = FALLBACK_ASSETS.filter(a =>
        a.id.toLowerCase().includes(q) ||
        a.type.toLowerCase().includes(q) ||
        a.serialNumber.toLowerCase().includes(q) ||
        a.batchId.toLowerCase().includes(q),
      );
      for (const a of matchedAssets) {
        results.push({
          id: a.id, type: 'asset', title: `${a.id} — ${a.type}`,
          subtitle: `${a.model} • ${a.serialNumber}`,
          url: `/app/assets/${a.id}`,
          status: a.lifecycle, badge: a.certStatus,
          relevance: 1.0,
        });
      }

      const matchedCerts = FALLBACK_CERTIFICATIONS.filter(c =>
        c.id.toLowerCase().includes(q) ||
        c.assetId.toLowerCase().includes(q) ||
        (c.txHash && c.txHash.toLowerCase().includes(q)),
      );
      for (const c of matchedCerts) {
        results.push({
          id: c.id, type: 'certification', title: c.id,
          subtitle: c.txHash || 'Pending',
          url: `/app/certifications/${c.id}`,
          status: c.status, relevance: 0.9,
        });
      }

      const matchedUsers = FALLBACK_USERS.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.did && u.did.toLowerCase().includes(q)),
      );
      for (const u of matchedUsers) {
        results.push({
          id: u.id, type: 'user', title: u.name, subtitle: u.email,
          url: `/app/users`, status: u.status,
          relevance: 0.8,
        });
      }

      const matchedTxs = FALLBACK_TRANSACTIONS.filter(t =>
        t.tx_hash.toLowerCase().includes(q) ||
        t.action.toLowerCase().includes(q),
      );
      for (const t of matchedTxs) {
        results.push({
          id: t.id, type: 'blockchain_tx', title: t.action, subtitle: t.tx_hash,
          url: `/app/blockchain`, status: t.status,
          relevance: 0.7,
        });
      }
    }

    const timeMs = Date.now() - start;
    return {
      results: results.sort((a, b) => b.relevance - a.relevance),
      query, total: results.length, time_ms: timeMs,
    };
  }
}
