import { useCallback } from 'react';
import { useWallet } from '@provablehq/aleo-wallet-adaptor-react';
import { PROGRAM_ID } from '../lib/aleo';
import { TOKEN_REGISTRY_PROGRAM_ID } from '../lib/constants';

export function useHarbor() {
  const { address, executeTransaction, requestRecords } = useWallet();

  const asTyped = useCallback((value: string, suffix: string) => (
    value.endsWith(suffix) ? value : `${value}${suffix}`
  ), []);

  const execute = useCallback(
    async (functionName: string, inputs: string[], fee: number = 500_000) => {
      if (!executeTransaction) throw new Error('Wallet not connected');
      const result = await executeTransaction({
        program: PROGRAM_ID,
        function: functionName,
        inputs,
        fee,
      });
      return result;
    },
    [executeTransaction],
  );

  const executeProgram = useCallback(
    async (program: string, functionName: string, inputs: string[], fee: number = 500_000) => {
      if (!executeTransaction) throw new Error('Wallet not connected');
      const result = await executeTransaction({
        program,
        function: functionName,
        inputs,
        fee,
      });
      return result;
    },
    [executeTransaction],
  );

  const getRecords = useCallback(
    async (program?: string) => {
      if (!requestRecords) throw new Error('Wallet not connected');
      return requestRecords(program || PROGRAM_ID, true);
    },
    [requestRecords],
  );

  const registerIssuer = useCallback(
    (licenseHash: string) => execute('register_issuer', [licenseHash], 1_000_000),
    [execute],
  );

  const revokeIssuer = useCallback(
    () => execute('revoke_issuer', [], 500_000),
    [execute],
  );

  const issueComplianceCredential = useCallback(
    (
      investor: string,
      jurisdiction: number,
      accredited: boolean,
      tier: number,
      credentialHash: string,
      issuedAt: string,
      expiry: string,
    ) =>
      execute(
        'issue_compliance_credential',
        [investor, `${jurisdiction}u8`, `${accredited}`, `${tier}u8`, credentialHash, asTyped(issuedAt, 'i64'), asTyped(expiry, 'i64')],
        1_500_000,
      ),
    [asTyped, execute],
  );

  const revokeComplianceCredential = useCallback(
    (credentialHash: string) => execute('revoke_compliance_credential', [credentialHash], 500_000),
    [execute],
  );

  const createOffering = useCallback(
    (
      offeringId: string,
      name: string,
      description1: string,
      description2: string,
      propertyType: number,
      location: string,
      assetHash: string,
      totalSupply: string,
      pricePerUnit: string,
      settlementAsset: number,
      lockupEnd: string,
      accreditedOnly: boolean,
      minSubscription: string,
      maxInvestors: string,
    ) =>
      execute(
        'create_offering',
        [
          offeringId,
          name,
          description1,
          description2,
          `${propertyType}u8`,
          location,
          assetHash,
          `${totalSupply}u64`,
          `${pricePerUnit}u64`,
          `${settlementAsset}u8`,
          asTyped(lockupEnd, 'i64'),
          `${accreditedOnly}`,
          `${minSubscription}u64`,
          `${maxInvestors}u32`,
        ],
        2_000_000,
      ),
    [asTyped, execute],
  );

  const approveInvestor = useCallback(
    (investor: string, offeringId: string) => execute('approve_investor', [investor, offeringId], 500_000),
    [execute],
  );

  const closeOffering = useCallback(
    (offeringId: string) => execute('close_offering', [offeringId], 500_000),
    [execute],
  );

  const subscribe = useCallback(
    (credential: string, offeringId: string, amount: string, positionId: string, issuer: string) =>
      execute('subscribe', [credential, offeringId, `${amount}u64`, positionId, issuer], 3_000_000),
    [execute],
  );

  const transferPosition = useCallback(
    (position: string, buyer: string) =>
      execute('transfer_position', [position, buyer], 1_500_000),
    [execute],
  );

  const declareDistribution = useCallback(
    (offeringId: string, distributionId: string, amountPerUnit: string) =>
      execute('declare_distribution', [offeringId, distributionId, `${amountPerUnit}u64`], 1_000_000),
    [execute],
  );

  const claimDistribution = useCallback(
    (position: string, distributionId: string, amountPerUnit: string) =>
      execute('claim_distribution', [position, distributionId, `${amountPerUnit}u64`], 1_500_000),
    [execute],
  );

  const createProposal = useCallback(
    (offeringId: string, proposalId: string, descriptionHash: string, votingEnd: string) =>
      execute('create_proposal', [offeringId, proposalId, descriptionHash, asTyped(votingEnd, 'i64')], 1_000_000),
    [asTyped, execute],
  );

  const castVote = useCallback(
    (position: string, proposalId: string, vote: boolean) =>
      execute('cast_vote', [position, proposalId, `${vote}`], 1_000_000),
    [execute],
  );

  const transferPublicCredits = useCallback(
    (recipient: string, amountMicrocredits: string) =>
      executeProgram('credits.aleo', 'transfer_public', [recipient, `${amountMicrocredits}u64`], 500_000),
    [executeProgram],
  );

  const transferTokenPublic = useCallback(
    (tokenId: string, recipient: string, amountBaseUnits: string) =>
      executeProgram(TOKEN_REGISTRY_PROGRAM_ID, 'transfer_public', [tokenId, recipient, `${amountBaseUnits}u128`], 600_000),
    [executeProgram],
  );

  return {
    address,
    getRecords,
    executeProgram,
    registerIssuer,
    revokeIssuer,
    issueComplianceCredential,
    revokeComplianceCredential,
    createOffering,
    approveInvestor,
    closeOffering,
    subscribe,
    transferPosition,
    declareDistribution,
    claimDistribution,
    createProposal,
    castVote,
    transferPublicCredits,
    transferTokenPublic,
  };
}
