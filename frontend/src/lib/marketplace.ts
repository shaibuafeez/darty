import { PROPERTY_TYPE_LABELS } from './constants';
import { readMapping, parseStructValue, stripTypeSuffix } from './aleo';
import { fieldChunksToText } from './utils';
import { Distribution, Offering, Proposal } from './types';

const REGISTRY_KEY = '0u8';

function parseNumber(raw: string | null): number {
  if (!raw) return 0;
  const parsed = Number.parseInt(stripTypeSuffix(raw), 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

async function readIndexedIds(countMapping: string, indexMapping: string): Promise<string[]> {
  const count = parseNumber(await readMapping(countMapping, REGISTRY_KEY));
  const ids = await Promise.all(
    Array.from({ length: count }, (_, index) => readMapping(indexMapping, `${index}u32`)),
  );
  return ids.filter((value): value is string => Boolean(value));
}

export async function readAllOfferings(): Promise<Offering[]> {
  const ids = await readIndexedIds('offering_count', 'offering_index');

  const offerings: Array<Offering | null> = await Promise.all(
    ids.map(async (id): Promise<Offering | null> => {
      const [infoRaw, metadataRaw, subscribedRaw, investorCountRaw] = await Promise.all([
        readMapping('offerings', id),
        readMapping('offering_metadata', id),
        readMapping('offering_subscribed', id),
        readMapping('offering_investor_count', id),
      ]);

      if (!infoRaw) return null;

      const info = parseStructValue(infoRaw);
      const metadata = metadataRaw ? parseStructValue(metadataRaw) : {};

      return {
        id,
        issuer: info.issuer || '',
        assetHash: info.asset_hash || '',
        totalSupply: parseNumber(info.total_supply || null),
        pricePerUnit: parseNumber(info.price_per_unit || null),
        settlementAsset: parseNumber(info.settlement_asset || null),
        lockupEnd: parseNumber(info.lockup_end || null),
        accreditedOnly: info.accredited_only === 'true',
        minSubscription: parseNumber(info.min_subscription || null),
        maxInvestors: parseNumber(info.max_investors || null),
        isActive: info.is_active === 'true',
        subscribed: parseNumber(subscribedRaw),
        investorCount: parseNumber(investorCountRaw),
        name: fieldChunksToText([metadata.name]),
        description: fieldChunksToText([metadata.description_1, metadata.description_2]),
        propertyType: PROPERTY_TYPE_LABELS[parseNumber(metadata.property_type || null)] || undefined,
        location: fieldChunksToText([metadata.location]),
      };
    }),
  );

  return offerings.filter((offering): offering is Offering => offering !== null);
}

export async function readAllDistributions(): Promise<Distribution[]> {
  const ids = await readIndexedIds('distribution_count', 'distribution_index');

  const distributions: Array<Distribution | null> = await Promise.all(
    ids.map(async (id): Promise<Distribution | null> => {
      const [amountRaw, offeringId] = await Promise.all([
        readMapping('distributions', id),
        readMapping('distribution_offering', id),
      ]);

      if (!amountRaw || !offeringId) return null;

      return {
        id,
        offeringId,
        amountPerUnit: parseNumber(amountRaw),
      };
    }),
  );

  return distributions.filter((distribution): distribution is Distribution => Boolean(distribution));
}

export async function readAllProposals(): Promise<Proposal[]> {
  const ids = await readIndexedIds('proposal_count', 'proposal_index');

  const proposals: Array<Proposal | null> = await Promise.all(
    ids.map(async (id): Promise<Proposal | null> => {
      const [proposalRaw, yesRaw, noRaw] = await Promise.all([
        readMapping('proposals', id),
        readMapping('proposal_yes', id),
        readMapping('proposal_no', id),
      ]);

      if (!proposalRaw) return null;

      const proposal = parseStructValue(proposalRaw);

      return {
        id,
        offeringId: proposal.offering_id || '',
        proposer: proposal.proposer || '',
        descriptionHash: proposal.description_hash || '',
        votingEnd: parseNumber(proposal.voting_end || null),
        isActive: proposal.is_active === 'true',
        yesVotes: parseNumber(yesRaw),
        noVotes: parseNumber(noRaw),
      };
    }),
  );

  return proposals.filter((proposal): proposal is Proposal => proposal !== null);
}

export async function readPositionCreatedAt(positionId: string): Promise<number> {
  return parseNumber(await readMapping('position_created_at', positionId));
}
