import {
  Listing,
  SoldTransaction,
  ComparableResult,
  ValuationReport,
  SimilarityBreakdown,
} from '../types/listing.ts';
import { initialSoldTransactions } from '../data/soldDeals.ts';

export interface TargetPropertyInput {
  areaFeddan: number;
  governorate: string;
  city: string;
  village?: string;
  roadType?: string;
  distanceFromMainRoad?: string;
  waterSource?: string;
  salinityPPM?: number;
  electricity?: boolean;
  electricityType?: string;
  cultivationStatus?: string;
  crops?: string;
  ownershipType?: string;
  irrigationType?: string;
}

/**
 * Calculates similarity breakdown (0-100%) between a target property and a sold transaction
 * Weights:
 * - الموقع: 30%
 * - المساحة: 15%
 * - المياه: 15%
 * - الطريق: 10%
 * - الكهرباء: 10%
 * - الزراعة: 10%
 * - البنية التحتية والملكية: 10%
 */
export function calculateSimilarity(
  target: TargetPropertyInput,
  tx: SoldTransaction
): SimilarityBreakdown {
  // 1. الموقع (30%)
  let locationScore = 0;
  if (target.governorate && tx.governorate) {
    if (target.governorate.trim() === tx.governorate.trim()) {
      locationScore += 15; // Same governorate
      if (
        target.city &&
        tx.city &&
        (target.city.includes(tx.city) || tx.city.includes(target.city))
      ) {
        locationScore += 10; // Same city/markaz
        if (
          target.village &&
          tx.village &&
          (target.village.includes(tx.village) || tx.village.includes(target.village))
        ) {
          locationScore += 5; // Same village
        } else {
          locationScore += 2; // Close proximity
        }
      }
    } else {
      // Neighbouring governorates partial credit
      const deltaDelta = ['البحيرة', 'الإسكندرية', 'المنوفية', 'الغربية'];
      if (deltaDelta.includes(target.governorate) && deltaDelta.includes(tx.governorate)) {
        locationScore += 6;
      }
    }
  }

  // 2. المساحة (15%)
  let areaScore = 0;
  const targetArea = target.areaFeddan > 0 ? target.areaFeddan : 1;
  const txArea = tx.areaFeddan > 0 ? tx.areaFeddan : 1;
  const areaRatio = Math.min(targetArea, txArea) / Math.max(targetArea, txArea);
  areaScore = Math.round(areaRatio * 15 * 10) / 10;

  // 3. المياه والملوحة (15%)
  let waterScore = 0;
  const targetWater = (target.waterSource || '').toLowerCase();
  const txWater = (tx.waterSource || '').toLowerCase();
  const isArt = targetWater.includes('ارتوازي') || targetWater.includes('بئر');
  const isTxArt = txWater.includes('ارتوازي') || txWater.includes('بئر');
  const isNile = targetWater.includes('نيلي') || targetWater.includes('ترعة') || targetWater.includes('بحاري');
  const isTxNile = txWater.includes('نيلي') || txWater.includes('ترعة') || txWater.includes('بحاري');

  if ((isArt && isTxArt) || (isNile && isTxNile)) {
    waterScore += 10;
  } else if ((isArt && isTxNile) || (isNile && isTxArt)) {
    waterScore += 4;
  } else {
    waterScore += 6;
  }

  // Salinity closeness (5%)
  if (target.salinityPPM && tx.salinityPPM) {
    const diff = Math.abs(target.salinityPPM - tx.salinityPPM);
    const salinityRatio = Math.max(0, 1 - diff / 800);
    waterScore += Math.round(salinityRatio * 5 * 10) / 10;
  } else {
    waterScore += 3;
  }

  // 4. الطريق والوصول (10%)
  let roadScore = 0;
  const targetRoad = target.roadType || '';
  const txRoad = tx.roadType || '';
  if (targetRoad === txRoad) {
    roadScore += 7;
  } else if (
    (targetRoad.includes('أسفلت') && txRoad.includes('خرساني')) ||
    (targetRoad.includes('مدق') && txRoad.includes('ترابي'))
  ) {
    roadScore += 5;
  } else {
    roadScore += 3;
  }
  roadScore += 3; // Baseline road proximity factor

  // 5. الكهرباء (10%)
  let electricityScore = 0;
  const targetElec = target.electricity ?? true;
  if (targetElec === tx.electricity) {
    electricityScore += 7;
    if (
      target.electricityType &&
      tx.electricityType &&
      target.electricityType.includes(tx.electricityType)
    ) {
      electricityScore += 3;
    } else {
      electricityScore += 1.5;
    }
  } else {
    electricityScore += 2;
  }

  // 6. الزراعة والمحاصيل (10%)
  let cultivationScore = 0;
  if (target.cultivationStatus && tx.cultivationStatus) {
    if (target.cultivationStatus === tx.cultivationStatus) {
      cultivationScore += 5;
    } else {
      cultivationScore += 2;
    }
  } else {
    cultivationScore += 3;
  }

  if (target.crops && tx.crops) {
    const tCrop = target.crops.toLowerCase();
    const xCrop = tx.crops.toLowerCase();
    if (tCrop.includes(xCrop) || xCrop.includes(tCrop)) {
      cultivationScore += 5;
    } else {
      cultivationScore += 2;
    }
  } else {
    cultivationScore += 2.5;
  }

  // 7. البنية التحتية والملكية (10%)
  let infraScore = 0;
  if (target.irrigationType && tx.irrigationType && target.irrigationType === tx.irrigationType) {
    infraScore += 5;
  } else {
    infraScore += 2.5;
  }

  if (target.ownershipType && tx.ownershipType && target.ownershipType === tx.ownershipType) {
    infraScore += 5;
  } else {
    infraScore += 3;
  }

  const totalScore = Math.min(
    100,
    Math.round(
      (locationScore +
        areaScore +
        waterScore +
        roadScore +
        electricityScore +
        cultivationScore +
        infraScore) *
        10
    ) / 10
  );

  return {
    location: Math.min(30, Math.round(locationScore * 10) / 10),
    area: Math.min(15, Math.round(areaScore * 10) / 10),
    water: Math.min(15, Math.round(waterScore * 10) / 10),
    road: Math.min(10, Math.round(roadScore * 10) / 10),
    electricity: Math.min(10, Math.round(electricityScore * 10) / 10),
    cultivation: Math.min(10, Math.round(cultivationScore * 10) / 10),
    infrastructure: Math.min(10, Math.round(infraScore * 10) / 10),
    totalScore,
  };
}

/**
 * Runs the Comparable Valuation Engine:
 * Finds top 10 comparable transactions, computes similarity scores and indicative valuation range.
 */
export function runComparableEngine(
  target: TargetPropertyInput,
  transactions: SoldTransaction[] = initialSoldTransactions
): ValuationReport {
  const scoredComparables: ComparableResult[] = transactions.map((tx) => {
    const similarity = calculateSimilarity(target, tx);
    const discount =
      tx.askingPrice > 0 ? ((tx.askingPrice - tx.soldPrice) / tx.askingPrice) * 100 : 0;
    return {
      transaction: tx,
      similarity,
      discountPercentage: Math.max(0, Math.round(discount * 10) / 10),
    };
  });

  // Sort descending by total similarity score
  scoredComparables.sort((a, b) => b.similarity.totalScore - a.similarity.totalScore);

  // Take top 10 comparables
  const top10 = scoredComparables.slice(0, 10);

  if (top10.length === 0) {
    return {
      targetAreaFeddan: target.areaFeddan,
      comparables: [],
      minPricePerFeddan: 0,
      maxPricePerFeddan: 0,
      weightedAvgPricePerFeddan: 0,
      minTotalEstimatedValue: 0,
      maxTotalEstimatedValue: 0,
      estimatedTotalValue: 0,
      avgNegotiationDiscount: 0,
    };
  }

  // Calculate prices
  const prices = top10.map((c) => c.transaction.soldPricePerFeddan);
  const minPricePerFeddan = Math.min(...prices);
  const maxPricePerFeddan = Math.max(...prices);

  // Weighted average price per feddan by similarity score
  const totalWeight = top10.reduce((sum, c) => sum + c.similarity.totalScore, 0);
  const weightedSum = top10.reduce(
    (sum, c) => sum + c.transaction.soldPricePerFeddan * c.similarity.totalScore,
    0
  );
  const weightedAvgPricePerFeddan =
    totalWeight > 0 ? Math.round(weightedSum / totalWeight) : Math.round(prices[0]);

  // Target area in feddan
  const targetArea = target.areaFeddan > 0 ? target.areaFeddan : 1;
  const estimatedTotalValue = Math.round(weightedAvgPricePerFeddan * targetArea);
  const minTotalEstimatedValue = Math.round(minPricePerFeddan * targetArea);
  const maxTotalEstimatedValue = Math.round(maxPricePerFeddan * targetArea);

  // Average negotiation discount
  const avgNegotiationDiscount =
    Math.round(
      (top10.reduce((sum, c) => sum + c.discountPercentage, 0) / top10.length) * 10
    ) / 10;

  return {
    targetAreaFeddan: targetArea,
    comparables: top10,
    minPricePerFeddan,
    maxPricePerFeddan,
    weightedAvgPricePerFeddan,
    minTotalEstimatedValue,
    maxTotalEstimatedValue,
    estimatedTotalValue,
    avgNegotiationDiscount,
  };
}

/**
 * Helper to convert a Listing into TargetPropertyInput
 */
export function listingToTargetInput(listing: Listing): TargetPropertyInput {
  let areaFeddan = listing.area;
  if (listing.areaUnit === 'قيراط') {
    areaFeddan = listing.area / 24;
  } else if (listing.areaUnit === 'متر') {
    areaFeddan = listing.area / 4200;
  }

  // Parse salinity if present (e.g. "450 PPM" -> 450)
  let salinityPPM: number | undefined = undefined;
  if (listing.waterSalinityTDS) {
    const match = listing.waterSalinityTDS.match(/(\d+)/);
    if (match) {
      salinityPPM = parseInt(match[1], 10);
    }
  }

  return {
    areaFeddan,
    governorate: listing.governorate,
    city: listing.city,
    village: listing.village,
    roadType: listing.roadType,
    distanceFromMainRoad: listing.distanceFromMainRoad,
    waterSource: listing.waterSourceType || listing.waterSource,
    salinityPPM,
    electricity: listing.electricity,
    electricityType: listing.electricityType,
    cultivationStatus: listing.cultivationStatus,
    crops: listing.mainCrops,
    ownershipType: listing.ownershipType || (listing.legalStatus as any),
    irrigationType: listing.irrigationType,
  };
}
